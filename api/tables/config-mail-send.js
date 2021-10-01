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
        SMTPPort: Sequelize.STRING,
        MailServer: Sequelize.STRING,
        IMPort: Sequelize.STRING,
        OMPort: Sequelize.STRING,
        SSL: Sequelize.BOOLEAN,
    });

    return table;
}