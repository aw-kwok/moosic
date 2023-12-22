const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { DatabaseInstance } = require("../queue.model")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queuelist")
        .setDescription("Lists queues in database")
        .addNumberOption((option) => option.setName("page").setDescription("Page of database").setMinValue(1)),

    run: async ({ client, interaction }) => {
        try {
            // calculate totalPages
            const numRows = await DatabaseInstance.query("SELECT COUNT(*) FROM queues") // get count of entries in database
            const totalPages = Math.ceil(numRows / 10) || 1
            if (debug) console.log(`totalPages = ${totalPages}`)

            const page = (interaction.options.getNumber("page") || 1) - 1

            // query 10 entries, sorted by name
            const query = await DatabaseInstance.query(`SELECT name FROM queues ORDER BY name LIMIT 10 OFFSET ${page * 10}`)
            if (debug) console.log(query[0])

            // logic for choosing which page
            if (page + 1 > totalPages) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription("Invalid page")
                    ]
                })
            }
            const queueString = query[0].slice(page * 10, page * 10 + 10).map((queue, i) => {
                return `**${page * 10 + i + 1}.** ${queue.name}`
            }).join("\n")

            // return embed with information
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Saved Queues`)
                        .setDescription(queueString)
                        .setFooter({
                            text: `Page ${page + 1} of ${totalPages}`
                        })
                ]
            })
        }
        catch(err) {
            console.error(err.message)
            return await interaction.editReply({
                embeds: [ new EmbedBuilder().setDescription("Unable to load from database") ]
            }) 
        }
    }
}