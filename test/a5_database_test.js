const assert = require('assert');
const path = require('path');


describe('Database Access', function(){

    var config = {};


    before(async function(){

        process.on('unhandledRejection', function (reason) {
            throw reason;
        });
        this.timeout(3000);

        var m = require(path.join(__dirname, "../startup/A09-migration"));
        await m(config);

        var db = require(path.join(__dirname, "../startup/A10-database"));
        await db(config);



    });
    it("Can create insert statement", function(){

        var insertStatement = config.databaseClient._createInsertStatement({"a": 10, "b": 20, "c": 30}, "test");

        assert.equal("INSERT INTO test(a,b,c) VALUES($1,$2,$3)", insertStatement);


    });
    it("can load test data", async function(){

        this.timeout(0);
        var l = require(path.join(__dirname, "../startup/A11-load"));
        await l(config);
        var e = await config.databaseClient.isTableEmpty("station");

        assert.ok(!e, "Loaded stations");

    });
    it("Can get observations by station", async function(){

        var stations = await config.databaseClient.getStations();

        if(stations.length)
            return config.databaseClient.getStationObservationTypes(stations[0].ghcnid).then((stations)=>{

                assert.ok(stations, "Some value for stations returns");
            });



    });
    it("Can query all stations", function(){



        return config.databaseClient.getStations().then((stations)=>{

            assert.ok(stations, "Some value for stations returns");
        });

    });
    it("Can query all stations by name", function(){


        return config.databaseClient.getStations('B').then((stations)=>{



            assert.ok(stations, "Some value for stations returns");

            assert.ok(!stations.some((s)=>!s.name.startsWith('B') ), "all match query");

        });

    });
    it("Can get each station", async function(){

        this.timeout(45000);

        var stations = await config.databaseClient.getStations();

        for(var i = 0; i < Math.min(200, stations.length); ++i)
        {

               var station = await config.databaseClient.getStation(stations[i].ghcnid);
               assert.deepEqual(station, stations[i]);
        }




    });

    it("Can get observations by type", async function(){

        this.timeout(45000);

        var stations = await config.databaseClient.getStations();

        for(var i = 0; i < Math.min(200, stations.length); ++i)
        {

            var observations = await config.databaseClient.getObservationsByTypeAndDate(stations[i].ghcnid, ['PRCP']) ;

            if(observations.length)
            {



                assert.ok(!stations.some((s)=>s.type != "PRCP"), "all match query");

            }

        }




    });
    after(()=>{

        return config.databaseClient.shutDown();

    })
    /*
    /*
        it("Can get station observations", async function(){

            var stations = await config.databaseClient.getStations();

            if(stations.length) {

                var observations = await config.databaseClient.getObservations(stations[0].ghcnid);

                assert.ok(!observations.some((o)=>o.ghcnid !== stations[0].ghcnid), "All returned observations have specified id" );



            }


        });
        it("Can get station observations by type", async function(){

            var stations = await config.databaseClient.getStations();
            var obsTypes = await config.databaseClient.getObservationTypes();
            if(stations.length && obsTypes.length) {

                var observations = await config.databaseClient.getObservationsByType(stations[0].ghcnid, obsTypes[0].type);

                assert.ok(!observations.some((o)=>o.ghcnid !== stations[0].ghcnid ), "All returned observations have specified id" );
                assert.ok(!observations.some((o)=>o.type !== obsTypes[0].type ), "All returned observations have specified id" );


            }


        });
    */




});