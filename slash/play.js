const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("loads songs from youtube")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("song")
                .setDescription("Loads a single song from a url")
                .addStringOption((option) => option.setName("url").setDescription("the song's url").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("playlist")
                .setDescription("Loads a playlist from youtube")
                .addStringOption((option) => option.setName("url").setDescription("the playlist's url").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("search")
                .setDescription("Searches for song based on provided keywords")
                .addStringOption((option) => option.setName("searchterms").setDescription("the search keywords").setRequired(true))
        ),
        run: async({ client, interaction }) => {
            if (!interaction.member.voice.channel) {
                return interaction.editReply("You need to be in a voice channel to use this command")
            }
            const queue = await client.player.nodes.create(interaction.guild)
            if (!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new EmbedBuilder()
            await client.player.extractors.loadDefault()

            if (interaction.options.getSubcommand() === "song") {
                let url = interaction.options.getString("url")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })
                if (result.tracks.length === 0) {
                    return interaction.editReply("No results")
                }
                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}][${song.url}]** has been added to the Queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Duration: ${song.duration}`})
            }
            else if (interaction.options.getSubcommand() === "playlist") {
                let url = interaction.options.getString("url")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST
                })
                if (result.tracks.length === 0) {
                    return interaction.editReply("No results")
                }
                const playlist = result.playlist
                await queue.addTrack(playlist)
                embed
                    .setDescription(`**${result.tracks.length} songs from [${playlist.title}][${playlist.url}]** have been added to the Queue`)
                    .setThumbnail(playlist.thumbnail)
            }
            else if (interaction.options.getSubcommand() === "search") {
                let url = interaction.options.getString("searchterms")
                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                })
                if (result.tracks.length === 0) {
                    return interaction.editReply("No results")
                }
                const song = result.tracks[0]
                console.log(song)
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}][${song.url}]** has been added to the Queue`)
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