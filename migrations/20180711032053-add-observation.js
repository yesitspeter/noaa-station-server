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
    db.createTable("observation", {
        id: {type: 'int', primaryKey: true, autoIncrement:true},
        station : {type:'string', length: 18 , foreignKey: {
              name: 'station_id_observation_station_fk',
              table: 'station',
              rules: {
                  onDelete: 'CASCADE'
              },
              mapping: {
                  station: 'ghcnid'
              }

            }},
        date: {type:'date'},
        type: {type:'string', length:4, foreignKey: {
                name: 'station_id_observation_observation_type_id_fk',
                table: 'observation_type',
                rules: {
                    onDelete: 'CASCADE'
                },
                mapping: {
                    type: 'type'
                }

            }},
        value: {type:'decimal'},
        time: {type:'int', notNull:false}



    }, callback);

};

exports.down = function(db, callback) {
    db.dropTable("observation", callback);

};

exports._meta = {
  "version": 1
};
