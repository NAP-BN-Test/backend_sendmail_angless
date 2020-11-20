const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CheckMail', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Email: Sequelize.STRING,
        Type: Sequelize.BOOLEAN,
    });
    return table;
}