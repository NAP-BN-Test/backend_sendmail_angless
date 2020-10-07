const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Contacts', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Email: Sequelize.STRING,
        TimeCreate: Sequelize.NOW,
        Type: Sequelize.INTEGER,
        UserID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT,
        JobTile: Sequelize.INTEGER,
        Gender: Sequelize.INTEGER,
        Phone: Sequelize.INTEGER,
        Address: Sequelize.INTEGER,
        Zalo: Sequelize.INTEGER,
        Facebook: Sequelize.INTEGER,
        Skype: Sequelize.INTEGER,
        AssignID: Sequelize.BIGINT,
        LastActivity: Sequelize.NOW,
        Status: Sequelize.STRING,
        Note: Sequelize.STRING,
        Fax: Sequelize.STRING,
        Active: Sequelize.STRING,
    });

    return table;
}