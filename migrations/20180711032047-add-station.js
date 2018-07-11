'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {

    db.createTable("station", {
       id: {type: 'int', primaryKey: true, autoIncrement:true},
       ghcnid : {type:'string', length:18, unique:true, notNull:true},
       state: {type:'string', length:2},
       name: {type:'string', length:255},
       lat: {type:'decimal'},
        long: {type:'decimal'},
        elevation: {type:'decimal'}



    }, callback);


};

exports.down = function(db, callback) {
    db.dropTable("station", callback);

};

exports._meta = {
  "version": 1
};
