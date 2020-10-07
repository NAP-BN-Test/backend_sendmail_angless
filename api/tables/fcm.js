const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('tblSysFCMToken', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        FCMToken: Sequelize.STRING,
    });

    return table;
}