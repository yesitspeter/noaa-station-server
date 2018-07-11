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
    db.createTable("observation_type", {
        id: {type: 'int', primaryKey: true, autoIncrement:true},
        type: {type:'string', length:5},
        units: {type:'string', length: 10},
        description: {type:'string', length:128}
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable("observation_type", callback);
};

exports._meta = {
  "version": 1
};
