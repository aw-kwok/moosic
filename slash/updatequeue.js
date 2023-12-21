const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Sequelize, DataTypes } = require("sequelize")
const dotenv = require("dotenv")
const isImageUrl = require('image-url-validator').default

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updatequeue")
        .setDescription("Updates a saved queue with the current queue")
        .addStringOption((option) => option.setName("name").setDescription("Name for the queue").setRequired(true))
        .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail url")),

    run: async ({ client, interaction }) => {
        //I used the guildQueue to get the guildQueue
        //console.log(client.player.nodes)//.get(interaction.guildId))
        // client.player.nodes is a GuildNodeManager
        // for queue to be of type GuildQueue, there are two ways to get a GuildQueue from a GuildNodeManager:
        //      1. the 'cache' property is a 'Collection<string, GuildQueue<unknown>>'
        //      2. the 'get(node)' method, where 'node' is of type 'NodeResolvable' which is either a 'GuildQueue' or 'GuildResolvable'
        const queue = client.player.nodes.get(interaction.guildId)

        if (!queue || queue.isEmpty()) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription("There are no songs in the queue")
                ]
            })
        }
        
        // add currentSong to front of queue
        const currentSong = queue.currentTrack
        await queue.insertTrack(currentSong, 0)
        
        // saves queue into a string
        const queueString = queue.tracks.toArray().slice(0, 10).map((song, i) => {
            return `**${i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n")

        const queueName = interaction.options.getString("name")

        // if thumbnail link is a valid image, set queueThumbnail to link, else set to current song's thumbnail
        const thumbnailLink = interaction.options.getString("thumbnail")
        const validThumbnail = await isImageUrl(thumbnailLink).then((isImage) => { return isImage })
        const queueThumbnail =  validThumbnail ? thumbnailLink : currentSong.thumbnail

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
        // add Queue model to database
        await sequelize.sync().then(() => {
            if (debug) console.log("Queue table created successfully.")
            
            async function updateQueue() {
                // delete database entry
                await Queue.findOne({
                    where: {
                        name: interaction.options.getString("name")
                    }
                }).then((res) => {
                    // inside SELECT query for debug purposes and to fetch thumbnail from database
                    Queue.destroy({
                        where: {
                            name: res.name
                        }
                    }).then(() => {
                        if (debug) console.log(`${res.name} has been deleted from the database`)
                    }).catch(() => {
                        embed = new EmbedBuilder().setDescription("Unable to delete old queue")
                    })       
                }).catch((error) => {
                    console.error("Unable to find queue")
                    embed = new EmbedBuilder().setDescription("Unable to find queue")
                }) 
                
                // add database entry
                async function addEntry() {
                // wait until name, queue, and thumbnail defined
                    if (queueName && queueThumbnail) {
                        await Queue.create({
                            name: queueName,
                            queue: queue.tracks.toJSON(),
                            thumbnail: queueThumbnail
                        })
                        if (debug) console.log(`${queueName} has been updated`)
                        embed = new EmbedBuilder()
                            .setTitle(`**${queueName}** has been updated`)
                            .setDescription(`${queueString}`)
                            .setThumbnail(queueThumbnail)
                            .setFooter({
                                text: `Page 1 of ${Math.ceil(queue.tracks.size / 10) || 1}`
                            })   
                    }
                    else {
                        setTimeout(addEntry, 250)
                    }
                }
                await addEntry()  
            }
            updateQueue()

            // remove database entry
           
            
        }).catch((error) => {
            console.error("Unable to create table: ", error)
            embed = new EmbedBuilder().setDescription("Unable to create table")
        })

        // wait for embed to be defined
        async function waitEmbed(){
            if (embed) {
                queue.node.remove(0) // remove added currentSong
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