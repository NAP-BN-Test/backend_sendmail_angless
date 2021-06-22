const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('ConfigMailSend', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        EmailSend: Sequelize.STRING,
        Type: Sequelize.BOOLEAN,
        Password: Sequelize.STRING,
    });

    return table;
}