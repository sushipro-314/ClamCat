exports.setup = async function (client, config) {

}
exports.helpData = {
    "title": "Moderation",
    "description": "Moderate your discord server!"
}

exports.commands = [
    {
        "id": "ban",
        "description": "Ban a user by ID (usage: 'prefix!ban <userID> <deleteSeconds> <reason>')",
        async execute(message, args) {
            let user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            try {
                user.ban({
                    deleteMessageSeconds: args[1],
                    reason: args.slice(2).join(" "),
                })
                message.reply("***User " + user.user.username + " has been banned***")
            } catch (err) {
                throw err
            }
        }
    },
    {
        "id": "kick",
        "description": "Kick a user by ID (usage: 'prefix!kick <userID> <reason>')",
        async execute(message, args) {
            const user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            try {
                user.kick(args.slice(1).join(" "))
                message.reply("***User " + user.user.username + " has been kicked***")
            } catch (err) {
                throw err;
            }
        }
    },
    {
        "id": "mute",
        "description": "Mutes/timeouts a user by ID (usage: 'prefix!timeout <userID> <duration> <reason>')",
        async execute(message, args) {
            const user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
            try {
                user.timeout(args[1] * 60 * 1000, args.slice(2).join(" "))
                message.reply("***User " + user.user.username + " has been muted***")
            } catch (err) {
                throw err;
            }
        }
    }
]