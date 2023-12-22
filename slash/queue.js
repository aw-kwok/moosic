const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("displays the current song queue")
        .addNumberOption((option) => option.setName("page").setDescription("Page number of the queue").setMinValue(1)),

        run: async ({ client, interaction }) => {
            const queue = client.player.nodes.get(interaction.guildId)

            if (!queue || queue.isEmpty()) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription("There are no songs in the queue")
                    ]
                })
            }
            
            const totalPages = Math.ceil(queue.tracks.size / 10) || 1
            const page = (interaction.options.getNumber("page") || 1) - 1

            if (page + 1 > totalPages) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription("Invalid page")
                    ]
                })
            }

            const queueString = queue.tracks.toArray().slice(page * 10, page * 10 + 10).map((song, i) => {
                return `**${page * 10 + i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
            }).join("\n")

            const currentSong = queue.currentTrack

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`**Currently Playing**\n` +
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${queueString}`
                        )
                        .setFooter({
                            text: `Page ${page + 1} of ${totalPages}`
                        })
                        .setThumbnail(currentSong.thumbnail)
                ]
            })
        },
}