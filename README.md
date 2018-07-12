# noaa-station

A server for NOAA Daily Global Historical Climatology Network data.

* Data Sources are configurable and can be easily expanded in future updates.
**  CSV and Fixed Width column files are supported
** Data is loaded through streams (gzip streams supported)
* The database is designed for future change (migrations)
* Data is served through a RESTful API and documented in the api.raml file

## Setup

Initial setup may require time to load the large input files.  They are streamed automatically and loaded into the database.

## Docker

A docker compose file is included.  Simply run

    docker-compose up


# Testing

Testing requires local Postgres database "noaa_stations".   Update "dev" configuration in database.json.  Testing is done using mocha.  This is a destructive test, it will clear all data and reload


