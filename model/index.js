const debug = require("debug")("lab7:model");
const mongo = require("mongoose");

let db = mongo.createConnection();
(async () => {
    try {
        await db.openUri('mongodb://user:user@yochidafna-shard-00-00-zemea.mongodb.net:27017,yochidafna-shard-00-01-zemea.mongodb.net:27017,yochidafna-shard-00-02-zemea.mongodb.net:27017/test?ssl=true&replicaSet=YochiDafna-shard-0&authSource=admin');
    } catch (err) {
        debug("Error connecting to DB: " + err);
    }
})();
debug('Pending DB connection');

require("./user")(db);

module.exports = model => db.model(model);
