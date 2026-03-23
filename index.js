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
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./common/config.json");
const { GuildMember, EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// Here is the commands list. This will be changed as we scan the modules directory for new modules that then add commands, although these ones are the default commands for now.
var commands = [
    {
        "id": "help",
        async execute(message, args) {
            var embeds = []
            modules.forEach(module => {
                if (!module.hidden) {
                    let fields = []
                    var embed = new EmbedBuilder().setTitle(client.user.username + " | " + " Module: " + module.helpData.title).setDescription(module.helpData.description)
                    if (module.commands) {
                        module.commands.forEach(commandData => {
                            if (!commandData.hidden) {
                                fields.push({ name: "Command: " + commandData.id, value: commandData.description })
                            }
                        });
                    } else {
                        fields.push({ name: "No Commands found!", value: "No commands to display at this time!" })
                    }
                    embed.addFields(fields)
                    embeds.push(embed)
                }
            });
            message.reply({
                content: "Help commands for bot " + client.user.username + " in server " + message.guild.name,
                embeds: embeds
            })
        }
    }
]
// Default metadata for the help command!
var defaultHelpData = {
    "title": "Unknown",
    "id": "unknown",
    "description": "No description provided!"
}

// Here is a list of modules that get scanned 
var modules = []

// A variable for checking if the commands have already been scanned.
var scanned = false

async function vaildateCommand(commandTable) {
    // Checks each command in a table for missing objects required to load the module
    if (!commandTable.description) {
        commandTable.description = defaultHelpData.description
    }
    if (!commandTable.aliases) {
        commandTable.aliases = [commandTable.id]
    }
    if (!commandTable.permissions) {
        commandTable.permissions = [PermissionsBitField.Default]
    }
}
// Setup function for the module
async function registerModule(pathName) {
    // Set extra paremeters in configuration (but not affect the file)
    config.modules = modules
    config.commands = commands
    // We require the module
    let module = require(pathName)
    // Then we call the setup function
    module["setup"](client, config)
    // Check if commands exist
    if (module.commands) {
        // Loop through each command in the commands array
        module.commands.forEach((command) => {
            // Validate the command by adding any missing settings to it
            vaildateCommand(command)
            // Add it to the commands array
            commands.push(command)
        })
    }
    modules.push(module)
}
// The path to which modules are scanned and loaded
var modulesFolder = "./common/modules"
// Client ready event for when the bot starts
client.on("clientReady", () => {
    // Checks the scanned variable to see if it's true
    if (!scanned) {
        // Reads the modules folder
        fs.readdir(modulesFolder, async (err, files) => {
            if (!err) {
                // Scans through every file pushes it to the commands array
                for (const file of files) {
                    // Register the module by appending the file to the module folder path
                    registerModule(modulesFolder + "/" + file)
                }
                // Set scanned to true
                scanned = true
            } else {
                // Throw an error if modules folder cannot be loaded properly
                throw err
            }
        })
    }
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
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

client.on("error", err => {
    console.error("An unknown error occurred in the bot: " + err.message)
    if (config.debug) {
        console.error(err.stack)
    }
});

if (config.debug) {
    client.on("debug", console.log)
}

client.on("messageCreate", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "cc!say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const commandsFound = commands.filter(commandFound => ((commandFound.id == command) || (commandFound.aliases && (command in commandFound.aliases))))
    if (commandsFound[0] && message.member.permissions.has(commandsFound[0].permissions)) {
        console.log("User ran command: " + command)
        await commandsFound[0].execute(message, args)
    } else {
        message.reply("```You either do not have permission to perform this action or the command you used does not exist.```")
    }
});

client.login(config.token);