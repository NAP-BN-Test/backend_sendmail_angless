const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('History', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        TimeCreate: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        Param: Sequelize.STRING,
        Name: Sequelize.STRING,
        Router: Sequelize.STRING
    });

    return table;
}