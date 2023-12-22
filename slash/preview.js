const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { Queue } = require("../queue.model")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("preview")
        .setDescription("Previews a saved queue")
        .addStringOption((option) => option.setName("name").setDescription("Name of queue").setRequired(true)),

    run: async ({ client, interaction }) => {
        try {
            // query name of queue
            const query = await Queue.findOne({
                where: { name: interaction.options.getString("name")}
            })
            if (debug) console.log(query.queue)

            // create queueString
            const queueString = query.queue.slice(0, 10).map((song, i) => {
                return `**${i + 1 + query.queue.length}.** \`[${song.duration}]\` ${song.title}`
            }).join("\n")

            return await interaction.editReply({
                embeds: [ new EmbedBuilder()
                    .setTitle(`Previewing ${interaction.options.getString("name")}`)
                    .setDescription(`${queueString}`)
                    .setThumbnail(query.thumbnail)
                    .setFooter({
                        text: `Page 1 of ${Math.ceil(query.queue.length / 10) || 1}`
                    }) ]
            })
        }
        catch (err) {
            console.error(err.message)
            return await interaction.editReply({
                embeds: [ new EmbedBuilder().setDescription("Unable to load from database") ]
            })
        }
    },
}