const { Client } = require('discord-cross-hosting');
const Cluster = require('discord-hybrid-sharding');
const config = require("./common/config.json")
const client = new Client(config.cluster.client);
client.on('debug', console.log);
client.connect();

const manager = new Cluster.ClusterManager(`${__dirname}/index.js`, config.cluster.manager); // Some dummy Data
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.on('debug', console.log);

client.listen(manager);
client
    .requestShardData()
    .then(e => {
        if (!e) return;
        if (!e.shardList) return;
        manager.totalShards = e.totalShards;
        manager.totalClusters = e.shardList.length;
        manager.shardList = e.shardList;
        manager.clusterList = e.clusterList;
        manager.spawn({ timeout: -1 });
    })
    .catch(e => console.log(e));