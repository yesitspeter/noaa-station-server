const assert = require('assert');
const path = require('path');
var request = require('supertest');
var promise = require('bluebird');

describe('Server', function(){

    var config = {};

    var server;

    before(async function(){

        process.on('unhandledRejection', function (reason) {
            throw reason;
        });

        this.timeout(3000);

        var m = require(path.join(__dirname, "../startup/A09-migration"));
        await m(config);

        var db = require(path.join(__dirname, "../startup/A10-database"));
        await db(config);

        server = require("../services/stations_service");

        return new Promise((resolve, reject)=>{



            server = server(config, resolve);
        })


    });
    it("Can execute stations query with no query",   function(done) {
        this.timeout(5000);

        request(server)
            .get("/api/v1/stations")
            .expect((res)=>{

                console.log(res.body);

            })
            .expect(200, done);


    });
    it("Can execute stations query",   function(done) {
        this.timeout(5000);

        request(server)
            .get("/api/v1/stations?q=ST")
            .expect((res)=>{

                console.log(res.body);
                assert.ok(res.body.length > 0, "Has a response");
            })
            .expect(200, done);


    });
    it("Can execute stations query and obtain individual station",   function(done) {

        this.timeout(5000);

        var stn ;
        request(server)
            .get("/api/v1/stations?q=ST")
            .expect((res)=>{

                console.log(res.body);
                assert.ok(res.body.length > 0, "Has a response");

                stn = res.body[0].id;

            })
            .expect(200, ()=>{


                request(server)
                    .get("/api/v1/stations/" + stn)
                    .expect(200, done);




            });


    });
    it("Can execute stations query and obtain observations",   function(done) {


        this.timeout(5000);

        var stn ;
        request(server)
            .get("/api/v1/stations?q=ST")
            .expect((res)=>{

                console.log(res.body);
                assert.ok(res.body.length > 0, "Has a response");

                stn = res.body[0].id;

            })
            .expect(200, ()=>{


                request(server)
                    .get("/api/v1/stations/" + stn + "/observations")
                    .expect(200, done);




            });



    });

    after(()=>{

        return config.databaseClient.shutDown();
        server.stop();


    })


});