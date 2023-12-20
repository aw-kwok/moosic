const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Move a track from one position in the queue to another")
        .addNumberOption((option) =>
            option.setName("oldposition").setDescription("Position of the track to move").setMinValue(1).setRequired(true))
        .addNumberOption((option) =>
            option.setName("newposition").setDescription("New position of the track").setMinValue(1).setRequired(true)),    

    run: async ({ client, interaction }) => {
        const queue = client.player.nodes.get(interaction.guildId)

        // if queue not initialized, send error message and return
        if (!queue) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("There are no songs in the queue")
                ]
            })
        }

        // set newPos and oldPos from user arguments
        const newPos = interaction.options.getNumber("newposition")
        const oldPos = interaction.options.getNumber("oldposition")

        // check if oldPos is within queue bounds
        if (oldPos > queue.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("Invalid oldposition")
                ]
            })
        }
        // check if newPos is within queue bounds
        if (newPos > queue.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("Invalid newposition")
                ]
            })
        }
        
        // move track
        const oldTrack = queue.removeTrack(oldPos - 1)
        queue.insertTrack(oldTrack, newPos - 1)

        // success message
        await interaction.editReply({
            embeds: [
                new EmbedBuilder().setDescription(`Moved [${oldTrack.title}](${oldTrack.url}) to position ${newPos}`)
            ]
        })
    },
}