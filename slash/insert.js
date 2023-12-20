const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("insert")
        .setDescription("Insert a track at a specified track position")
        .addStringOption((option) => 
            option.setName("input").setDescription("A search term or link").setRequired(true))
        .addNumberOption((option) =>
            option.setName("tracknumber").setDescription("The track to insert").setMinValue(1).setRequired(true)),
    run: async ({ client, interaction }) => {
        let embed = new EmbedBuilder()

        const queue = await client.player.nodes.create(interaction.guild)

        const trackNum = interaction.options.getNumber("tracknumber") - 1
        if (trackNum > queue.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder().setDescription("Invalid track number")
                ]
            })
        }
    
        if (!interaction.member.voice.channel) {
            return interaction.editReply({
                embeds: [
                    embed.setDescription("You need to be in a voice channel to use this command")
                ]
            })
        }
        
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        
        await client.player.extractors.loadDefault()

        const input = interaction.options.getString("input")

        // url validation
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
                await queue.insertTrack(song, trackNum)
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to position ${trackNum + 1}`)
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
                // loop through songs in playlist, inserting elements in order
                for (let i = 0; i < result.tracks.length; i++) {
                    await queue.insertTrack(result.tracks[i], trackNum + i)
                }
                embed
                    .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to position ${trackNum + 1}`)
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
                await queue.insertTrack(song, trackNum)
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to position ${trackNum + 1}`)
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
                // loop through songs in playlist, inserting elements in order
                for (let i = 0; i < result.tracks.length; i++) {
                    await queue.insertTrack(result.tracks[i], trackNum + i)
                }
                embed
                    .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to position ${trackNum + 1}`)
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
                // loop through songs in playlist, inserting elements in order
                for (let i = 0; i < result.tracks.length; i++) {
                    await queue.insertTrack(result.tracks[i], trackNum + i)
                }
                embed
                    .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to position ${trackNum + 1}`)
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
            await queue.insertTrack(song, trackNum)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to position ${trackNum + 1}`)
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
    }
}