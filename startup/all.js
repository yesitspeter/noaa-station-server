

const config = {};

require("fs").readdirSync(__dirname).forEach(function (file) {
    if (file !== "all.js") {
        const gen = require("./" + file);

        gen(config);
    }
});

/**
 * @typedef Configuration
 * @type {object}
 * @property {DatabaseClient} databaseClient
 */

/**
 *
 * @type {Configuration}
 *
 */
module.exports = config;




