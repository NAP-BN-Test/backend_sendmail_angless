const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Template', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Subject: Sequelize.STRING,
        body: Sequelize.STRING,
        TimeCreate: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeRemind: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        TimeUpdate: Sequelize.NOW
    });

    return table;
}