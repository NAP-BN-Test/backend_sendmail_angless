const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('UserFollow', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        Follow: Sequelize.BOOLEAN,
        Type: Sequelize.INTEGER,
        CompanyID: Sequelize.BIGINT,
        ContactID: Sequelize.BIGINT,
    });

    return table;
}