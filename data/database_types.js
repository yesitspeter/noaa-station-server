




/**
 * Station Database Row
 * @typedef {object} StationRow
 * @property {number} id
 * @property {string} ghcnid
 * @property {string} name
 * @property {number} lat
 * @property {number} lon
 * @property {elevation} lon
 */

/**
 * Observation Database Row
 * @typedef {object} Observation
 * @property {number} id
 * @property {string} station - station ghcnid
 * @property {string} type - observation type name
 * @property {number} value
 * @property {number} time
 */

/**
 * Observation Type Database Row
 * @typedef {object} ObservationType
 * @property {number} id
 * @property {string} type
 * @property {string} units
 * @property {string} description
 */




