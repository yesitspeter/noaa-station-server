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

exports.up = function(db) {
    db.createTable("observation", {
        id: {type: 'int', primaryKey: true, autoIncrement:true},
        stationId : {type:'int', foreignKey: {
              name: 'station_id_observation_stationId_fk',
              table: 'station',
              rules: {
                  onDelete: 'CASCADE'
              },
              mapping: {
                  stationId: 'id'
              }

            }},
        date: {type:'date'},
        observationTypeId: {type:'int', foreignKey: {
                name: 'station_id_observation_observation_type_id_fk',
                table: 'observation_type',
                rules: {
                    onDelete: 'CASCADE'
                },
                mapping: {
                    observationTypeId: 'id'
                }

            }},
        value: {type:'decimal'},
        observationTime: {type:'int', notNull:false}



    }, callback);

};

exports.down = function(db) {
    db.dropTable("observation", callback);
};

exports._meta = {
  "version": 1
};
