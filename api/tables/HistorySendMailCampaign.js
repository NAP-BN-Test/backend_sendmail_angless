const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('HistorySendMailCampaign', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        MailCampainID: Sequelize.BIGINT,
        MailListID: Sequelize.BIGINT,
        DateTime: Sequelize.NOW,
        Random: Sequelize.STRING,
    });

    return table;
}