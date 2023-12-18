const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Loads a song or playlist from YouTube or Spotify")
        .addStringOption((option) => option.setName("input").setDescription("A search term or link").setRequired(true)),

        run: async({ client, interaction }) => {
            let embed = new EmbedBuilder()
            if (!interaction.member.voice.channel) {
                return interaction.editReply({
                    embeds: [
                        embed.setDescription("You need to be in a voice channel to use this command")
                    ]
                })
            }
            const queue = await client.player.nodes.create(interaction.guild)
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)
            
            await client.player.extractors.loadDefault()

            const input = interaction.options.getString("input")

            const isValidUrl = input => {
                var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
                '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
                return !!urlPattern.test(input);
            }

            if (isValidUrl && (input.includes("youtube") || input.includes("youtu.be"))) { // handle YouTube links
                if (!input.includes("playlist")) {
                    const result = await client.player.search(input, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.YOUTUBE_VIDEO
                    })

                    if (result.tracks.length === 0) {
                        return await interaction.editReply({
                            embeds: [
                                embed.setDescription("No results found")
                            ]
                        })
                    }

                    const song = result.tracks[0]
                    await queue.addTrack(song)
                    embed
                        .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                        .setThumbnail(song.thumbnail)
                        .setFooter({ text: `Duration: ${song.duration}`})
                }
                else {
                    const result = await client.player.search(input, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.YOUTUBE_PLAYLIST
                    })
                    if (result.tracks.length === 0) {
                        return interaction.editReply("No results")
                    }
                    const playlist = result.playlist
                    await queue.addTrack(playlist)
                    embed
                        .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the queue`)
                        .setThumbnail(playlist.thumbnail)
                }
            }
            else if (isValidUrl && input.includes("spotify")) { //handle spotify links
                if (input.includes("track")) {
                    const result = await client.player.search(input, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SPOTIFY_SONG
                    })

                    if (result.tracks.length === 0) {
                        return await interaction.editReply({
                            embeds: [
                                embed.setDescription("No results found")
                            ]
                        })
                    }
                    const song = result.tracks[0]
                    await queue.addTrack(song)
                    embed
                        .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                        .setThumbnail(song.thumbnail)
                        .setFooter({ text: `Duration: ${song.duration}`})
                }
                else if (input.includes("playlist")) {
                    const result = await client.player.search(input, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SPOTIFY_PLAYLIST
                    })
                    if (result.tracks.length === 0) {
                        return interaction.editReply("No results")
                    }
                    const playlist = result.playlist
                    await queue.addTrack(playlist)
                    embed
                        .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the queue`)
                        .setThumbnail(playlist.thumbnail)
                }
                else if (input.includes("album")) {
                    const result = await client.player.search(input, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.SPOTIFY_ALBUM
                    })
                    if (result.tracks.length === 0) {
                        return interaction.editReply("No results")
                    }
                    const playlist = result.playlist
                    await queue.addTrack(playlist)
                    embed
                        .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the queue`)
                        .setThumbnail(playlist.thumbnail)
                }
            }
            else { // search
                const result = await client.player.search(input, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                })
                if (result.tracks.length === 0) {
                    return interaction.editReply("No results")
                }
                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Duration: ${song.duration}`})
            }

            // The queue is full of tracks, regardless of how we got here
            // queue is type GuildQueue
            // queue.tracks is type Queue<Track>

            // the 'play(channel, query, option)' function from the Player object automatically handles the search, playlist, link functionality that has been coded above
            // link: https://github.com/Androz2091/discord-player/blob/76935ad46993f2eaac9bbdff4a02b3de488c0319/packages/discord-player/src/Player.ts#L314
            //if (!queue.isPlaying()) await queue.play(queue.tracks.at(0))
            const player = queue.player
            const vc = player.client.channels.resolve(queue.channel);
            const options = {}
            if (!vc?.isVoiceBased()) throw Exceptions.ERR_INVALID_ARG_TYPE('channel', 'VoiceBasedChannel', !vc ? 'undefined' : `channel type ${vc.type}`);
            
            try {
                if(!queue.channel) await queue.connect(vc, {})
                if (!queue.isPlaying()) await queue.node.play(null, {})
            }
            finally {
                queue.tasksQueue.release()                
            }

            await interaction.editReply({
                embeds: [embed]
            })
        },
}