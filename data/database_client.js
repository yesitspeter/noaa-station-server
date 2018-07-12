
class DatabaseClient {

    constructor(databaseClient) {
        this._database = databaseClient;



    }




    async isTableEmpty(table) {


       var result =  await this._database.one('select COUNT(*) as C from ' + table );

       return result["c"] < 1;


    }
    /**
     * Get stations starting with the specified query against the name.  Will return max results
     * @param {string} query - prefix
     * @param {number} max - max results to return, defaults to 10
     */
    getStations(query, max) {


        if(query) {
            query = query.replace("%", "\\%");

            if (!max || max < 0)
                max = 10;


            return this._database.any('select * from station where name LIKE $1 order by name LIMIT ' + max, query + "%");

        }
        return this._database.any('select * from station');

    }

    /**
     * Obtain station information
     * @param {string} ghcnid  The ghcnid of the station
     * @returns {Promise<StationRow[]>}
     */
    getStation(ghcnid) {

        return this._database.any('select * from station where ghcnid=$1', ghcnid);

    }

    /**
     * Obtain observations from a station, and filter by the observation type
     * @param {string} ghcnid  The ghcnid of the station
     * @param {string[]} observationType - the 4 letter observation types to return, required
     * @returns {Promise<Observation[]>}
     */
    getObservationsByTypeAndDate(ghcnid, observationTypes, startDate, endDate ) {

        if (!observationTypes)
            return this.getObservations(ghcnid);

        var queryParams = [ghcnid];
        var inList = [];
        observationTypes.forEach((a, i) => {
            queryParams.push(a);
            inList.push("$" + (i + 1));
        });

        var query = 'select * from observation as o where o.station=$1 and type in (' + inList.join(',') + ') ';


        if (startDate){
            queryParams.push(startDate);
            query += " and date >= $" + queryParams.length + " ";
        }

        if(endDate) {
            queryParams.push(endDate);
            query += " and date <  $" + queryParams.length  + " ";
        }


        return this._database.any(query, queryParams );

    }

    /**
     * Gets the observation types for this station
     * @param station
     * @returns {Promise<ObservationType[]>}
     */
    getStationObservationTypes(station)
    {

        return this._database.any('select distinct t.* from observation_type as t join observation as o on t.type = o.type and o.station=$1 order by t.type', station);


    }

    /**
     * Obtain observations from a station
     * @param {string} ghcnid  The ghcnid of the station
     * @param {string} observationType - the ghcn observation type
     * @returns {Promise<Observation[]>}
     */
    getObservations(ghcnid) {

        return this._database.any('select * from observations where ghcnid=$1', ghcnid);

    }

    /**
     * Obtain observation type information
     * @returns {Promise<ObservationType[]>}
     */
    getObservationTypes() {

       return  this._database.any('select * from observation_type');


    }

    /**
     * Creates an insert statement.  Exposed here for testing purposes.
     * @param obj
     * @param table
     * @returns {string}
     * @private
     */
    _createInsertStatement(obj, table)
    {

        var keysSorted = Object.keys(obj).sort();

        return  "INSERT INTO " + table + "(" + keysSorted.join(",")  + ") VALUES("+ keysSorted.map((v,index)=>'$' + (index+1)).join(",") + ")";


    }

    /**
     * Shuts down the client
     */
    shutDown()
    {

        return this._database.$pool.end();

    }


    /**
     *
     * @param table
     * @param array
     * @returns {external:Promise|Promise<spex.IArrayExt<any>>|Promise<any>}
     */
    batchInsert(table, array) {
        var self = this;

        return  this._database.tx(t => {
            var keysSorted;
            var cmd;

            var promises = array.map((data) => {


                if (keysSorted == null)
                    keysSorted = Object.keys(data).sort();

                var values = keysSorted.map(k => data[k]);

                if (cmd == null)
                    cmd = self._createInsertStatement(data, table);


                return t.none(cmd, values);
            });

            return t.batch(promises);

        });

    }





}


module.exports = DatabaseClient;