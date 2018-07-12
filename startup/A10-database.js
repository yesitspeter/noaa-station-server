

const fs = require("fs");
const DatabaseClient = require("../data/database_client");
const pgp = require("pg-promise")();
const path = require('path');



function GetDatabaseConfigurationFromDatabaseJson() {

    var contents = fs.readFileSync( path.join(__dirname, '..', "database.json"), "utf8");
    var parsed = JSON.parse(contents);


    var env = process.env["NODE_ENV"] || "dev";
    console.log("Using environment " + env);

    var settings = parsed[env]
    Object.keys(settings).forEach((k)=>{
        if(typeof settings[k] == 'object' && 'ENV' in settings[k])
        {
            settings[k] = process.env[settings[k].ENV];

            if(!settings[k])
                console.warn("Setting '" + k + "' is not set" );
            else
                console.log("Setting '" + k + "' is "  + settings[k] );

        }

    });


    return settings;

}



module.exports = function(config)
{
    var pgpClient =  pgp(GetDatabaseConfigurationFromDatabaseJson());
    config.databaseClient = new DatabaseClient(pgpClient);


};


