const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('NoteComment', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        ActivityID: Sequelize.BIGINT,
        TimeCreate: Sequelize.NOW,
        Contents: Sequelize.STRING,
        UserID: Sequelize.BIGINT,
        UserName: Sequelize.STRING
    });

    return table;
}