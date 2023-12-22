const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear all tracks from the queue"),
    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        if (!queue) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("There are no songs in the queue")
                ]
            })
        }

        queue.clear()
        
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription(`Queue has been cleared.`)
            ]
        })
    },
}