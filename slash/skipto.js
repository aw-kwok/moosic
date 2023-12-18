const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("Skips to a certain track number")
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The track to skip to").setMinValue(1).setRequired(true)),
    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        if (!queue) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("There are no songs in the queue")
                ]
            })
        }

        const trackNum = interaction.options.getNumber("tracknumber")
        if (trackNum > queue.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("Invalid track number")
                ]
            })
        }
        queue.node.skipTo(trackNum - 1)
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription(`Skipped to track number ${trackNum}`)
            ]
        })
    },
}