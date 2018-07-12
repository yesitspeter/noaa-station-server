const promise = require('bluebird');

process.on('unhandledRejection', function (reason) {
    throw reason;
});

var configFn = require("./startup/all");

console.log("Waiting for a moment");

promise.delay(8000).then(()=>configFn()).then((config)=> {

    var services = require("./services/stations_service");


    services(config);


});

