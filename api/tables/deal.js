const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Deals', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.INTEGER,
        StageID: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        TimeClose: Sequelize.NOW,
        TimeRemind: Sequelize.NOW,
        Amount: Sequelize.FLOAT,
        CompanyID: Sequelize.BIGINT,
        PipeLine: Sequelize.INTEGER,
        ContactID: Sequelize.BIGINT
    });

    return table;
}