const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('MailResponse', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        MailListDetailID: Sequelize.BIGINT,
        TimeCreate: Sequelize.NOW,
        MailCampainID: Sequelize.BIGINT,
        Type: Sequelize.INTEGER,
        Reason: Sequelize.STRING,
        CompanyID: Sequelize.BIGINT,
        TypeSend: Sequelize.STRING,
        MaillistID: Sequelize.BIGINT,
        IDGetInfo: Sequelize.BIGINT,
        Email: Sequelize.STRING,
        TickSendMail: Sequelize.STRING,
    });

    return table;
}