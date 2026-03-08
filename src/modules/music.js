const { Player, useMainPlayer, useQueue } = require('discord-player');
const { EmbedBuilder } = require("discord.js")
const { SoundcloudExtractor } = require("discord-player-soundcloud");
const { SpotifyExtractor } = require("discord-player-spotify");
const { AppleMusicExtractor } = require("discord-player-applemusic");
exports.setup = async function (client, config) {
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
        queue.metadata.reply(`An unknown error occurred! Try again later!\nError: ${error}`);
    });
}

exports.commands = [
    {
        "id": "play",
        async execute(message, args) {
            const player = useMainPlayer(); // get player instance
            const channel = message.member.voice.channel;
            if (!channel) return message.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
            if (args.length < 0) return message.reply("You must specify a song to play!")
            const query = args[0] // we need input/query to play
            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: message, // we can access this metadata object using queue.metadata later on
                },
            });
            var embedPlay = new EmbedBuilder().setTitle("Now Playing: " + track.title).setImage(track.thumbnail).setDescription(track.description).setAuthor({ name: 'Some name', iconURL: track.thumbnail, url: track.url })
            message.reply({content: "**Now Playing**: " + track.title, embeds: [embedPlay]})
        },
    },
    {
        "id": "playing",
        async execute(message, args) {
            const queue = useQueue(message.guild);
            if (queue.isPlaying()) {
                const track = queue.currentTrack
                var embedPlay = new EmbedBuilder().setTitle("Now Playing: " + track.title).setImage(track.thumbnail).setDescription(track.description).setAuthor({ name: 'Some name', iconURL: track.thumbnail, url: track.url })
                message.reply({content: "**Now Playing**: " + track.title, embeds: [embedPlay]})
            } else {
                queue.metadata.reply("No song is currently playing!")
            }
        }
    },
    {
        "id": "skip",
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
        async execute(message, args) {
            const queue = useQueue(message.guild);
            queue.node.stop();
            queue.clear()
            message.reply("Queue has been cleared and stopped successfully!")
        },
    },
]