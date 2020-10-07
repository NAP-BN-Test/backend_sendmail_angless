const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('DealStage', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Process: Sequelize.INTEGER,
        Stage: Sequelize.INTEGER,
    });

    return table;
}