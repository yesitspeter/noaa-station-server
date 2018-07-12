

const fs = require("fs");
const DatabaseClient = require("../data/database_client");
const pgp = require("pg-promise")();
const path = require('path');



function GetDatabaseConfigurationFromDatabaseJson() {

    var contents = fs.readFileSync( path.join(__dirname, '..', "database.json"), "utf8");
    var parsed = JSON.parse(contents);

    var env = process.env["NODE_ENV"] || "dev";

    return parsed[env];

}



module.exports = function(config)
{
    var pgpClient =  pgp(GetDatabaseConfigurationFromDatabaseJson());
    config.databaseClient = new DatabaseClient(pgpClient);


};


