const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailListDetail', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Email: Sequelize.STRING,
        OwnerID: Sequelize.BIGINT,
        TimeCreate: Sequelize.NOW,
        MailListID: Sequelize.BIGINT,
        DataID: Sequelize.BIGINT,
        Name: Sequelize.STRING,
    });

    return table;
}