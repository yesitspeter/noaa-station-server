const DBMigrate = require('db-migrate');
const path = require('path');


module.exports = async function (config) {

    var dbmigrate = DBMigrate.getInstance(true, {env: "dev", cwd: path.join(__dirname, ".."), throwUncatched: true});

    await dbmigrate.up();

};


