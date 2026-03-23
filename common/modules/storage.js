const { MongoClient } = require('mongodb');

module.exports = {
    "hidden": true,
    "defaultStorage": {
        "type": "JSON",
        "location": "./common/data.json"
    },
    "StorageFunctionTypes": {
        "DB": {
            async SetupStorage(storage) {
                if (!exports.db) {
                    exports.db = new MongoClient(storage.location, storage.dbOptions)
                }
            },
            async GetAll(section, data) {
                if (data) {
                    return exports.db.db("clamcat").collection(section).find(data)
                } else {
                    return exports.db.db("clamcat").collection(section).find({})
                }
            },
            async GetOne(section, data) {
                exports.db.db("clamcat").collection(section).findOne(data).then((document) => {
                    return document
                }).catch(function (reason) {
                    throw Error("Database experienced an error getting from the database: " + reason)
                })
            },
            async SetData(section, data) {
                exports.db.db("clamcat").collection(section).replaceOne(data).catch(function (reason) {
                    throw Error("Database experienced an error replacing data from the database: " + reason)
                })
                return (await this.GetOne(section, data))
            },
            async DeleteData(section, data) {
                exports.db.db("clamcat").collection(section).deleteMany(data).catch(function (reason) {
                    throw Error("Database experienced an error replacing data from the database: " + reason)
                })
                return (await this.GetOne(section, data))
            }
        }
    },
    "setup": async function (client, config) {
        exports.storage = config["storage"]
        if (!exports.storage) {
            exports.storage = module.exports.defaultStorage
        }
        exports.storageFunctions = this.StorageFunctionTypes[exports.storage['type']]
    },
}