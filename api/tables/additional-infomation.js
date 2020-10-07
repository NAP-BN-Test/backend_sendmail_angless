const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('AdditionalInfomation', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Owner: Sequelize.STRING,
        OurRef: Sequelize.STRING,
        PAT: Sequelize.STRING,
        Applicant: Sequelize.STRING,
        ApplicationNo: Sequelize.STRING,
        ClassA: Sequelize.STRING,
        FilingDate: Sequelize.DATE,
        PriorTrademark: Sequelize.STRING,
        RegNo: Sequelize.STRING,
        ClassB: Sequelize.STRING,
        Firm: Sequelize.STRING,
        Address: Sequelize.STRING,
        Tel: Sequelize.STRING,
        Fax: Sequelize.STRING,
        Email: Sequelize.STRING,
        Status: Sequelize.STRING,
        Rerminder: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        TimeStart: Sequelize.NOW,
        Description: Sequelize.STRING,
        TimeRemind: Sequelize.NOW,
        UserID: Sequelize.BIGINT,
        TimeUpdate: Sequelize.NOW,
        CampaignID: Sequelize.BIGINT,
        ContactID: Sequelize.BIGINT,
    });

    return table;
}