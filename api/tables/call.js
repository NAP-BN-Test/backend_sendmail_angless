const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Calls', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        ContactID: Sequelize.BIGINT,
        CompanyID: Sequelize.BIGINT,
        State: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeRemind: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}