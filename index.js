// Load up the discord.js library
const Discord = require("discord.js");

// Load the library responsible for file management in Node.JS
const fs = require("node:fs")

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMembers,
    ],
});

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// Here is the commands list. This will be changed as we scan the modules directory for new modules that then add commands, although these ones are the default commands for now.
var commands = []

// Here is a list of modules that get scanned 
var modules = []

client.on("clientReady", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
    // Reads the modules folder
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("debug", console.log)

client.on("messageCreate", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    commands.forEach(async commandData => {
        if ((commandData.id == command) || (commandData.aliases && (command in commandData.aliases))) {
            console.log("User ran command: " + command)
            await commandData.execute(message, args)
        }
    });
});

fs.readdir("./src/modules", async (err, files) => {
    if (!err) {
        // Scans through every file pushes it to the commands array
        for (const file of files) {
            let module = require(__dirname + "/src/modules/" + file)
            module.setup(client, config)
            if (module.commands) {
                module.commands.forEach((command) => {
                    commands.push(command)
                })
            }
        }
    }
})

client.login(config.token);