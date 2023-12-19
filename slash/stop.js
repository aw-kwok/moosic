const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the bot, clears the queue, and leaves the voice channel"),
    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        if (!queue) {
            return await interaction.editReply("There are no songs in the queue")
        }

        queue.delete()
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("Thank you for using moosic!")
            ]
        })
    },
}