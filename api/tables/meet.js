const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Meets', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT,
        ContactID: Sequelize.BIGINT,
        Duration: Sequelize.FLOAT,
        TimeCreate: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        TimeRemind: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}