const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailListCampaign', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        MailListID: Sequelize.BIGINT,
        MailCampainID: Sequelize.BIGINT
    });

    return table;
}