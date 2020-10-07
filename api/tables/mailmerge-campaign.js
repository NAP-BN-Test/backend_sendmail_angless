const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailmergeCampaign', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Template_ID: Sequelize.BIGINT,
        Create_Date: Sequelize.NOW,
        Create_User: Sequelize.INTEGER,
        Number_Address: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeRemind: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}