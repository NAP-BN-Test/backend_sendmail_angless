const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CategoryJobTile', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING
    });

    return table;
}