const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Sequelize, DataTypes } = require("sequelize")
const dotenv = require("dotenv")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deletequeue")
        .setDescription("Deletes a queue from the database")
        .addStringOption((option) => option.setName("name").setDescription("Name of the queue").setRequired(true)),

    run: async ({ client, interaction }) => {
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
            Queue.findOne({
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
                    embed = new EmbedBuilder()
                        .setTitle(`**${res.name}** has been deleted from the database`)
                        .setThumbnail(res.thumbnail)
                }).catch(() => {
                    embed = new EmbedBuilder().setDescription("Unable to delete queue")
                })       
            }).catch((error) => {
                console.error("Unable to find queue")
                embed = new EmbedBuilder().setDescription("Unable to find queue")
            })            
            
        }).catch((error) => {
            console.error("Unable to create table: ", error)
            embed = new EmbedBuilder().setDescription("Unable to create table")
        })

        // wait for embed to be defined
        async function waitEmbed(){
            if (embed) {
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