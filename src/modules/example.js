exports.hidden = true
exports.setup = async function (client, config) {
    console.log("Example!")
}
exports.helpData = {
    "title": "Example",
    "description": "Template command for the bot!"
}

exports.commands = [
    {
        "id": "example",
        async execute(message, args) {
            message.reply("Hello there, " + message.member.username + "! You selected the following arguments: " + args.join(" - "))
        }
    }
]