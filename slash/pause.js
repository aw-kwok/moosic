const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the music"),
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

        if (queue.node.isPaused()) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("moosic is already paused")
                ]
            })
        }

        queue.node.pause()
        const currentSong = queue.currentTrack

        let bar = queue.node.createProgressBar({
            queue: false,
            length: 19
        })

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setThumbnail(currentSong.thumbnail)
                    .setDescription(`**Paused:** [${currentSong.title}](${currentSong.url})\n\n` + bar)
                    .setFooter({ text: `Duration: ${queue.node.getTimestamp().total.label}`})
        ],
        })
    },
}