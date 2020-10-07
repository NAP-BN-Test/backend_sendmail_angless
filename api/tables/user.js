const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Users', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Username: Sequelize.STRING,
        Password: Sequelize.STRING,
        Name: Sequelize.STRING,
        Roles: Sequelize.INTEGER,
        Phone: Sequelize.STRING,
        Email: Sequelize.STRING,
        TimeCreate: Sequelize.NOW,
        TimeLogin: Sequelize.NOW,
        NameAcronym: Sequelize.STRING
    });

    return table;
}