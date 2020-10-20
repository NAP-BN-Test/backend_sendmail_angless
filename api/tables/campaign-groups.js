const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CampaignGroups', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        IDCampaign: Sequelize.BIGINT,
        IDGroup: Sequelize.BIGINT,
    });

    return table;
}