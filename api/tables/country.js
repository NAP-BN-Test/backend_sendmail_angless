const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Countries', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Code: Sequelize.STRING,
        Name: Sequelize.STRING,
    });

    return table;
}