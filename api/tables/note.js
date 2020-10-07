const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Notes', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Description: Sequelize.STRING,
        TimeRemind: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        TimeCreate: Sequelize.NOW,
        ContactID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}