const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")
const { Queue } = require("../queue.model")

const debug = false

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playqueue")
        .setDescription("Plays a saved queue")
        .addStringOption((option) => option.setName("name").setDescription("Name of queue").setRequired(true)),

    run: async ({ client, interaction }) => {
        const queue = await client.player.nodes.create(interaction.guild)
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        await client.player.extractors.loadDefault()

        try {
            // query name of queue
            const query = await Queue.findOne({
                where: { name: interaction.options.getString("name")}
            })
            if (debug) console.log(query.queue)

            // create queueString
            const queueString = query.queue.slice(0, 10).map((song, i) => {
                return `**${i + 1 + queue.tracks.size}.** \`[${song.duration}]\` ${song.title}`
            }).join("\n")

            // query returns TrackJSON object, which there is no way to convert back to Track
            // everything in res.queue has a link to a song, so add all to queue by searching
            // wrap in async so we can await results
            async function addSongs() {
                await interaction.editReply({
                    embeds: [ new EmbedBuilder().setDescription("Loading songs into queue...") ]
                })

                for (let i = 0; i < query.queue.length; i++) {
                    const input = query.queue[i].url
                    if (input.includes("youtube") || input.includes("youtu.be")) { // handle YouTube links
                        const result = await client.player.search(input, {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.YOUTUBE_VIDEO
                        })
        
                        if (result.tracks.length === 0) {
                            console.error(`No results found for ${query.queue[i].title}`)
                            continue
                        }
        
                        const song = result.tracks[0]
                        queue.addTrack(song)
                    }
                    else if (input.includes("spotify")) {
                        const result = await client.player.search(input, {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.SPOTIFY_SONG
                        })
                        if (result.tracks.length === 0) {
                            console.error(`No results found for ${query.queue[i].title}`)
                            continue
                        }
                        const song = result.tracks[0]
                        queue.addTrack(song)
                    }
                }
            }
            await addSongs() // await loop execution

            // play functionality
            const player = queue.player
            const vc = player.client.channels.resolve(queue.channel);
            const options = {}
            if (!vc?.isVoiceBased()) throw Exceptions.ERR_INVALID_ARG_TYPE('channel', 'VoiceBasedChannel', !vc ? 'undefined' : `channel type ${vc.type}`);
            
            try {
                if (!queue.channel) await queue.connect(vc, {})
                if (!queue.isPlaying()) await queue.node.play(null, {})
            }
            finally {
                queue.tasksQueue.release()                
            }

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Added ${query.queue.length} songs from ${query.name}`)
                        .setThumbnail(query.thumbnail)
                        .setDescription(queueString)
                ]
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