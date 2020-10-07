const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MeetAttend', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        MeetID: Sequelize.BIGINT,
    });

    return table;
}