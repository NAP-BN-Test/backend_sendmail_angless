const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('FileAttach', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.BIGINT,
        Link: Sequelize.BIGINT,
        CampaignID: Sequelize.BIGINT
    });

    return table;
}