const { Bridge } = require('discord-cross-hosting');
const config = require("./common/config.json")
var token = config.cluster.server.token
if (!token) {
    token = config.token
}
const server = new Bridge(config.cluster.server);

server.on('debug', console.log);
server.start();
server.on('ready', url => {
    console.log('Server is ready' + url);
});