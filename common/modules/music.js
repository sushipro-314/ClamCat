const { Player, useMainPlayer, useQueue } = require('discord-player');
const { EmbedBuilder } = require("discord.js")
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { SpotifyExtractor } = require("discord-player-spotify");
const { AppleMusicExtractor } = require("discord-player-applemusic");

module.exports = {
    "setup": async function (client, config) {
        const player = new Player(client);
        await player.extractors.register(SoundcloudExtractor);
        await player.extractors.register(SpotifyExtractor);
        await player.extractors.register(AppleMusicExtractor);
        // this event is emitted whenever discord-player starts to play a track
        player.events.on('playerStart', (queue, track) => {
            // we will later define queue.metadata object while creating the queue
            queue.metadata.reply(`Started playing **${track.cleanTitle}**!`);
        });
        player.events.on('playerError', (queue, error) => {
            // we will later define queue.metadata object while creating the queue
            queue.metadata.reply(`An unknown error occurred! Try again later!\nError message: ${error.message}`);
        });
    },
    "helpData": {
        "title": "Music",
        "description": "Commands & Utlilies for playing music in a voice channel"
    },
    "commands": [
        {
            "id": "play",
            "description": "Plays a song in a voice channel",
            async execute(message, args) {
                const player = useMainPlayer(); // get player instance
                const queue = useQueue(message.guild);
                const channel = message.member.voice.channel;
                if (!channel) return message.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
                if (args.length < 0) return message.reply("You must specify a song to play!")
                const query = args.join(" ") // we need input/query to play
                const { track } = await player.play(channel, query, {
                    nodeOptions: {
                        // nodeOptions are the options for guild node (aka your queue in simple word)
                        metadata: message, // we can access this metadata object using queue.metadata later on
                    },
                });
                if (queue && queue.isPlaying()) {
                    var embedPlay = new EmbedBuilder().setTitle("Added to queue: " + track.title).setImage(track.thumbnail).setDescription(track.description).setAuthor({ name: track.author, iconURL: track.thumbnail, url: track.url })
                    message.reply({ content: "**Added to queue**: " + track.title, embeds: [embedPlay] })
                } else {
                    var embedPlay = new EmbedBuilder().setTitle("Now Playing: " + track.title).setImage(track.thumbnail).setDescription(track.description).setAuthor({ name: track.author, iconURL: track.thumbnail, url: track.url })
                    message.reply({ content: "**Now Playing**: " + track.title, embeds: [embedPlay] })
                }
            },
        },
        {
            "id": "view",
            "aliases": ["queue", "q"],
            "description": "Views the currently playing queue",
            async execute(message, args) {
                const queue = useQueue(message.guild);
                if (queue.isPlaying()) {
                    const track = queue.currentTrack
                    var embed = new EmbedBuilder().setTitle("Now Playing: " + track.title).setImage(track.thumbnail).setDescription("Queue information for server " + message.guild.name)
                    var fields = []
                    queue.tracks.toArray().forEach(tr => {
                        fields.push({"name": tr.title, "value": "Track by " + track.author})
                    });
                    embed.addFields(fields)
                    message.reply({ content: "**Now Playing**: " + track.title, embeds: [embed] })
                } else {
                    queue.metadata.reply("No song is currently playing!")
                }
            },
        },
        {
            "id": "playing",
            "description": "Displays what is playing in a voice channel",
            async execute(message, args) {
                const queue = useQueue(message.guild);
                if (queue.isPlaying()) {
                    const track = queue.currentTrack
                    var embedPlay = new EmbedBuilder().setTitle("Now Playing: " + track.title).setImage(track.thumbnail).setDescription(track.description).setAuthor({ name: track.cleanTitle, iconURL: track.thumbnail, url: track.url })
                    message.reply({ content: "**Now Playing**: " + track.title, embeds: [embedPlay] })
                } else {
                    queue.metadata.reply("No song is currently playing!")
                }
            }
        },
        {
            "id": "skip",
            "description": "Skips what is playing in a voice channel",
            async execute(message, args) {
                const channel = message.member.voice.channel;
                const queue = useQueue(message.guild);
                if (!channel) return message.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
                if (args.length < 0) return message.reply("You must specify a song to play!")
                const query = args[0] // we need input/query to play
                queue.node.skip()
                message.reply("Skipped from queue successfully!")
            },
        },
        {
            "id": "stop",
            "description": "Stops what is playing in a voice channel and clears the queue for the server",
            async execute(message, args) {
                const queue = useQueue(message.guild);
                queue.node.stop();
                queue.clear()
                message.reply("Queue has been cleared and stopped successfully!")
            },
        },
    ]
}