const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MeetContact', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        MeetID: Sequelize.BIGINT,
        ContactID: Sequelize.BIGINT,
    });

    return table;
}