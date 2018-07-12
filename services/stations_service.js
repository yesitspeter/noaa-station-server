module.exports = function (config, callback) {


    const express = require('express');
    const moment = require('moment');

    const app = express();
    const api = express();


    app.use("/api/v1/", api);


    api.get("/stations", function (req, res) {


        var limit = req.query.limit;
        var q = req.query.q || "";

        config.databaseClient.getStations(q, limit).then((result) => {

            res.status(200).json(result.map((station) => {
                return {
                    id: station.ghcnid,
                    name: station.name
                };
            }));


        }).catch(err => {
            res.status(500);
            console.error(err);
        });


    });


    api.get("/stations/:station", function (req, res) {

        var stationId = req.params.station;


        config.databaseClient.getStation(stationId).then((stations) => {


            if (stations.length == 0)
                res.status(404);
            else {
                var station = stations[0];


                config.databaseClient.getStationObservationTypes(stationId).then((observatonTypes) => {

                    res.status(200).json(
                        {
                            id: station.ghcnid,
                            name: station.name,
                            lat: station.lat,
                            long: station.long,
                            elevation: station.elevation,


                            observationTypes: observatonTypes.map((t) => {
                                return {
                                    type: t.type,
                                    description: t.description,
                                    units: t.unit
                                };
                            })
                        }
                    );


                });


            }


        }).catch(err => {
            res.status(500);
            console.error(err);
        });


    });

    api.get("/stations/:station/observations", function (req, res) {
        var stationId = req.params.station;

        var types = req.query.types || "PRCP,SNOW,SWND,TMAX,TMIN"

        var startDate = req.query.startDate;

        var endDate = req.query.endDate;

        try {
            if (startDate) {

                startDate = moment(startDate).toDate();

            }
            if (endDate) {

                endDate = moment(endDate).toDate();

            }
            types = types.split(",").map(s => s.trim());

        } catch (e) {
            console.error(e);
            res.status(400);
            return;

        }


        config.databaseClient.getStation(stationId).then((stations) => {


            if (stations.length == 0) {  //make sure station exists
                res.status(404);
                return;

            }
            else {


                config.databaseClient.getObservationsByTypeAndDate(stationId, types, startDate, endDate).then((observations) => {

                    res.status(200).json(
                        observations.map((o) => {
                            return {
                                id: o.id,
                                type: o.type,
                                date: o.date,
                                value: o.value


                            };


                        })
                    );


                });


            }


        }).catch(err => {
            res.status(500);
            console.error(err);
        });


    });


    app.listen(8888, () => {
        console.log("Listening on port 8888");
        if (callback)
            callback();
    });


    return app;


}