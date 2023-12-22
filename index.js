const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const { GatewayIntentBits } = require("discord.js")
const { EmbedBuilder } = require("discord.js")
const { loadQueue } = require("./queue.model")

const debug = false

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load" // to load slashcommands `node index.js load`

const CLIENT_ID = "1186078850136940654"
const GUILD_ID = "711036166257770517"

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

let commands = []

//loading slash commands by looking through slash directory for .js files, loads to commands array
const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles) {
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

// if user `node index.js load`
if (LOAD_SLASH) {
    const rest = new REST({ version: "9"}).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err) {
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })

    // define variables to be used with multiple listeners
    let followUp
    let prevInteraction

    // listens for when a user creates an interaction
    client.on("interactionCreate", (interaction) => {
        if (debug) console.log("interactionCreate detected from Discord")
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply({ embeds: new EmbedBuilder().setDescription("Not a valid slash command") })

            await interaction.deferReply()
            await slashcmd.run({ client, interaction }) // run slash command

            prevInteraction = interaction
            if (debug) console.log(`prevInteraction set to /${interaction.commandName}`)
        }
        handleCommand()
    })
    // listens for when the player starts playing, on instance of a new track
    client.player.events.on("playerStart", (queue, track) => {
        if (debug) console.log(`playerStart detected`)
        async function handlePlayerStart() {
            // wait until prevInteraction is defined by handleCommand()
            if (prevInteraction) {
                // delete previous now playing embed
                followUp?.then(msg =>{
                    msg.delete()
                    if (debug) console.log(`followUp for /${prevInteraction.commandName} deleted`)
                })
                // create followUp with now playing information
                followUp = prevInteraction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setThumbnail(track.thumbnail)
                            .setTitle("Now Playing")
                            .setDescription(`**[${track.title}](${track.url})**`)
                    ]
                })
                if (debug) console.log(`new followUp created`)
            }
            else {
                setTimeout(handlePlayerStart, 250)
            }
        }
        handlePlayerStart()
    })
    // error handling (for example, YouTube age-restricted videos)
    client.player.events.on("playerError", (queue, error, track) => {
        if (debug) console.log(`playerError detected`)
        console.log(error.message)

        async function handlePlayerError() {
            if (prevInteraction) {
                // send error message to channel of last interaction
                prevInteraction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("There was an error playing the track, skipping to next track")
                    ]
                })
            }
            else {
                setTimeout(handlePlayerError, 250)
            }
        }
        handlePlayerError()
    })
    client.player.events.on("error", (queue, error, track) => {
        if (debug) console.log(`error detected`)
        console.log(error.message)

        async function handleError() {
            if (prevInteraction) {
                // send error message to channel of last interaction
                prevInteraction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("There was an error playing the track, skipping to next track")
                    ]
                })
            }
            else {
                setTimeout(handleError, 250)
            }
        }
        handleError()
    })


    // error handling
    process.on("error", (error) => {
        console.error(error.message)
    })
    process.on("uncaughtException", (err) => {
        console.error(err.message)
        if (prevInteraction) {
            prevInteraction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("There was an error playing the track, skipping to next track")
                ]
            })
        }
    })
    client.login(TOKEN)
}