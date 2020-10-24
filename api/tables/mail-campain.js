const Sequelize = require('sequelize');
// datetime bắt buộc phải khai báo now TimeSend: Sequelize.NOW
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
        Type: Sequelize.STRING,
        TimeSend: Sequelize.NOW,
        ResBody: Sequelize.STRING,
        IDTemplateReminder: Sequelize.BIGINT,
        StatusCampaign: Sequelize.BOOLEAN,
        IDGroup1: Sequelize.BIGINT,
        TimeSend: Sequelize.NOW,
    });

    return table;
}