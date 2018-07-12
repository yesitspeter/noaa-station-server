const assert = require('assert');
const DBMigrate = require('db-migrate');


describe('Database Migrations', ()=> {

    it("Can migrate up", ()=>{

        var dbmigrate = DBMigrate.getInstance(true, {env:"dev", throwUncatched:true});



       return dbmigrate.reset().then(()=> dbmigrate.up());


    });
    after(()=>{

        var dbmigrate = DBMigrate.getInstance(true, {env:"dev", throwUncatched:true});



        return dbmigrate.reset().then(()=> dbmigrate.down());


    });

});