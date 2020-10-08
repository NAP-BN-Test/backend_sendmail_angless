const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CompanyMailList', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        MailListID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT
    });

    return table;
}