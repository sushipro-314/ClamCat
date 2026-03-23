module.exports = {
    "hidden": true,
    "setup": async function (client, config) {
        console.log("Example!")
    },
    "helpData": {
        "title": "Example",
        "description": "Template command for the bot!"
    },
    "commands": [
        {
            "id": "example",
            async execute(message, args) {
                message.reply("Hello there, " + message.member.username + "! You selected the following arguments: " + args.join(" - "))
            }
        }
    ]
}