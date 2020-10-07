const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Emails', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        ContactID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT,
        State: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        TimeRemind: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}