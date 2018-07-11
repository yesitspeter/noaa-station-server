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
    db.addIndex("station", "station_ghcnid_idx", ["ghcnid"], false, callback);
};

exports.down = function(db, callback) {
    db.removeIndex("station", "station_ghcnid_idx", callback);
};


exports._meta = {
  "version": 1
};
