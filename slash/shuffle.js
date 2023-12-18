const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the queue"),
    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        if (!queue) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription("There are no songs in the queue")
                ]
            })
        }

        queue.tracks.shuffle()
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription("The queue has been shuffled")
            ]
        })
    },
}