const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailCampain', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Subject: Sequelize.STRING,
        TimeCreate: Sequelize.NOW,
        OwnerID: Sequelize.BIGINT,
        MailListID: Sequelize.BIGINT,
        TemplateID: Sequelize.BIGINT,
        NumberAddressBook: Sequelize.INTEGER,
        Body: Sequelize.STRING,
        Description: Sequelize.STRING,
        Type: Sequelize.STRING
    });

    return table;
}