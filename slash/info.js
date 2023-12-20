const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays info about a specific song in the queue")
        .addNumberOption((option) =>
            option.setName("position").setDescription("The track's position in the queue").setMinValue(1).setRequired(true)),

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        // if queue not initialized, send error message and return
        if (!queue) {
            return await interaction.editReply("There are no songs in the queue")
        }


        // assign position based off user argument
        const position = interaction.options.getNumber("queuePosition")

        if (position > queue.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("Invalid oldPosition")
                ]
            })
        }

        // search for song by index
        const song = queue.tracks.at(position - 1)

        // success message
        await interaction.editReply({
            embeds: [new EmbedBuilder()
            .setThumbnail(song.thumbnail)
            .setDescription(`**[${song.title}](${song.url})**`)
        ],
        })
    },
}