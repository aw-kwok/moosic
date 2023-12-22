const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Queue } = require("../queue.model")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deletequeue")
        .setDescription("Deletes a queue from the database")
        .addStringOption((option) => option.setName("name").setDescription("Name of the queue").setRequired(true)),

    run: async ({ client, interaction }) => {
        // add Queue model to database
        try {
            // query name to fetch thumbnail
            const query = await Queue.findOne({
                where: {
                    name: interaction.options.getString("name")
                }
            })
            if (debug) console.log(`${query.thumbnail} has been retrieved`)

            // delete queue
            await Queue.destroy({
                where: {
                    name: query.name
                }
            })
            if (debug) console.log(`${query.name} has been deleted from the database`)
            
            // send success message
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`**${query.name}** has been deleted from the database`)
                        .setThumbnail(query.thumbnail)
                ]
            }) 
        }
        catch(err) {
            console.error(err.message)
            return await interaction.editReply({
                embeds: [ new EmbedBuilder().setDescription("Unable to load from database") ]
            }) 
        }
    },
}