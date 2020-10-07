const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailList', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        OwnerID: Sequelize.BIGINT,
        TimeCreate: Sequelize.NOW
    });

    return table;
}