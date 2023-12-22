const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const dotenv = require("dotenv")
const isImageUrl = require('image-url-validator').default
const { Queue } = require("../queue.model")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updatequeue")
        .setDescription("Updates a saved queue with the current queue")
        .addStringOption((option) => option.setName("name").setDescription("Name for the queue").setRequired(true))
        .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail url")),

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
        
        // add currentSong to front of queue
        const currentSong = queue.currentTrack
        await queue.insertTrack(currentSong, 0)
        
        // saves queue into a string
        const queueString = queue.tracks.toArray().slice(0, 10).map((song, i) => {
            return `**${i + 1}.** \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>`
        }).join("\n")

        const queueName = interaction.options.getString("name")
        if (debug) console.log(typeof(queueName))

        // if thumbnail link is a valid image, set queueThumbnail to link, else set to current song's thumbnail
        const thumbnailLink = interaction.options.getString("thumbnail")
        const validThumbnail = await isImageUrl(thumbnailLink).then((isImage) => { return isImage })

        try {
            // update queue to query
            const query = await Queue.findOne({
                where: { name: interaction.options.getString("name")}
            })

            // update queue
            query.queue = queue.tracks.toJSON()
            if (debug) console.log(`After queue update ${query.queue}`)

            // update thumbnail if valid image url is provided
            if (validThumbnail) {
                query.thumbnail = thumbnailLink
                if (debug) console.log(`After thumbnail update ${query.thumbnail}`)
            }

            await query.save() // save changes in database
            await queue.insertTrack(currentSong, 0) // remove temporarily added song from queue
            
            return await interaction.editReply({
                embeds: [ new EmbedBuilder()
                    .setTitle(`**${queueName}** has been updated`)
                    .setDescription(`${queueString}`)
                    .setThumbnail(query.thumbnail)
                    .setFooter({
                        text: `Page 1 of ${Math.ceil(queue.tracks.size / 10) || 1}`
                    }) ]
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