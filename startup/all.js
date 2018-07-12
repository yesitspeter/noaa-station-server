

const configData = {};


async function config() {
    var files = require("fs").readdirSync(__dirname);

    for (var i = 0; i < files.length; ++i) {
        var file = files[i];

        if (file !== "all.js") {
            const gen = require("./" + file);

            await gen(config);
        }

    }
    return configData;

}
/**
 * @typedef Configuration
 * @type {object}
 * @property {DatabaseClient} databaseClient
 */

/**
 *
 * @type {promise<Configuration>}
 *
 */
module.exports = config;




