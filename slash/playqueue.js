const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Sequelize, DataTypes } = require("sequelize")
const { QueryType } = require("discord-player")
const dotenv = require("dotenv")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playqueue")
        .setDescription("Plays a saved queue")
        .addStringOption((option) => option.setName("name").setDescription("Name of queue").setRequired(true)),

    run: async ({ client, interaction }) => {
        //I used the guildQueue to get the guildQueue
        //console.log(client.player.nodes)//.get(interaction.guildId))
        // client.player.nodes is a GuildNodeManager
        // for queue to be of type GuildQueue, there are two ways to get a GuildQueue from a GuildNodeManager:
        //      1. the 'cache' property is a 'Collection<string, GuildQueue<unknown>>'
        //      2. the 'get(node)' method, where 'node' is of type 'NodeResolvable' which is either a 'GuildQueue' or 'GuildResolvable'
        const queue = await client.player.nodes.create(interaction.guild)
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        await client.player.extractors.loadDefault()

        // configure dotenv
        dotenv.config()

        // declare .env variables
        DATABASE_NAME = process.env.DATABASE_NAME
        DATABASE_USERNAME = process.env.DATABASE_USERNAME
        DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
        DATABASE_HOST = process.env.DATABASE_HOST

        // create database connection
        // using https://www.digitalocean.com/community/tutorials/how-to-use-sequelize-with-node-js-and-mysql#step-1-installing-and-configuring-sequelize
        const sequelize = new Sequelize(
            DATABASE_NAME,
            DATABASE_USERNAME,
            DATABASE_PASSWORD,
            {
                host: DATABASE_HOST,
                dialect: 'mysql'
            }
        )

        // database authentication
        await sequelize.authenticate().then(() => {
            console.log("Connection has been established successfully.")
        }).catch((error) => {
            console.error("Unable to connect to the database: ", error)
        })

        // creates Queue model for queues table with primary key String name and JSON queue variables
        const Queue = sequelize.define("queues", {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                get() {
                    return this.getDataValue("name")
                }
            },
            queue: {
                type: DataTypes.JSON,
                allowNull: false,
                get() {
                    return this.getDataValue("queue")
                }
            },
            thumbnail: {
                type: DataTypes.STRING,
                allowNull: false,
                get() {
                    return this.getDataValue("thumbnail")
                }
            }
        })

        let embed
        let queueString
        // add Queue model to database
        await sequelize.sync().then(() => {
            if (debug) console.log("Queue table created successfully.")
            Queue.findOne({
                where: { name: interaction.options.getString("name")},
            }).then((res) =>{
                if (debug) console.log(res.queue)
                queueString = res.queue.slice(0, 10).map((song, i) => {
                    return `**${i + 1 + queue.tracks.size}.** \`[${song.duration}]\` [${song.title}]`
                }).join("\n")
                
                //if (debug) console.log(res.queue)
                // query returns TrackJSON object, which there is no way to convert back to Track
                // everything in res.queue has a link to a song, so add all to queue by searching
                // async wrapper so result can await search
                async function addSongs(){
                    for (let i = 0; i < res.queue.length; i++) {
                        const input = res.queue[i].url
                        if (input.includes("youtube") || input.includes("youtu.be")) { // handle YouTube links
                            const result = await client.player.search(input, {
                                requestedBy: interaction.user,
                                searchEngine: QueryType.YOUTUBE_VIDEO
                            })
            
                            if (result.tracks.length === 0) {
                                console.error(`No results found for ${res.queue[i].title}`)
                                continue
                            }
            
                            const song = result.tracks[0]
                            queue.addTrack(song)
                        }
                        else if (input.includes("spotify")) {
                            const result = await client.player.search(input, {
                                requestedBy: interaction.user,
                                searchEngine: QueryType.SPOTIFY_SONG
                            })
                            if (result.tracks.length === 0) {
                                console.error(`No results found for ${res.queue[i].title}`)
                                continue
                            }
                            const song = result.tracks[0]
                            queue.addTrack(song)
                        }
                    }
                }
                addSongs()
                embed = new EmbedBuilder()
                    .setTitle(`Added ${res.queue.length} songs from ${res.name}`)
                    .setThumbnail(res.thumbnail)
                    .setDescription(queueString)
                
                // wait for embed
                async function playQueue() {
                    if (!queue.isEmpty()) {
                        const player = queue.player
                        const vc = player.client.channels.resolve(queue.channel);
                        const options = {}
                        if (!vc?.isVoiceBased()) throw Exceptions.ERR_INVALID_ARG_TYPE('channel', 'VoiceBasedChannel', !vc ? 'undefined' : `channel type ${vc.type}`);
                        
                        try {
                            if (!queue.channel) await queue.connect(vc, {})
                            if (!queue.isPlaying()) await queue.node.play(null, {})
                        }
                        finally {
                            queue.tasksQueue.release()                
                        }
                    }
                    else {
                        setTimeout(playQueue, 250)
                    }
                }
                playQueue()
                
            }).catch((err) => {
                console.error("Queue not found!")
                embed = new EmbedBuilder().setDescription("Queue not found")
            })
            
        }).catch((error) => {
            console.error("Unable to create table: ", error)
            embed = new EmbedBuilder().setDescription("Unable to create table")
        })

        // wait for embed to be defined
        async function waitEmbed(){
            if (embed) {
                // if there is a title, that means the playqueue was successful
                await interaction.editReply({
                    embeds: [embed]
                }) 
            }
            else {
                setTimeout(waitEmbed, 250)
            }
        }
        waitEmbed()
    },
}