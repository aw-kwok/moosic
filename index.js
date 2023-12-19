const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")
const { GatewayIntentBits } = require("discord.js")
const { EmbedBuilder } = require("discord.js")

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"

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

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles) {
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

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

    let followUp
    let prevInteraction
    let embed = new EmbedBuilder().setDescription(`Loading...`)// on start, create a player embed

    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })

            prevInteraction = interaction
            followUp?.then(msg =>{
                msg.delete()
                followUp = undefined
            })
        }
        handleCommand()
    })
    client.player.events.on("playerStart", (queue, track) => {
        async function handlePlayerStart() {
            if (prevInteraction) {
                // delete previous now playing embed
                followUp?.then(msg =>{
                    msg.delete()
                })
                embed
                    .setThumbnail(track.thumbnail)
                    .setTitle("Now Playing")
                    .setDescription(`**[${track.title}](${track.url})**`)
                followUp = prevInteraction.followUp({
                    embeds: [embed]
                })
            }
            else {
                setTimeout(handlePlayerStart, 250)
            }
        }
        handlePlayerStart()
    })
    client.player.events.on("playerError", (queue, error) => {
        async function handlePlayerError() {
            if (prevInteraction) {
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
    
    client.login(TOKEN)
}