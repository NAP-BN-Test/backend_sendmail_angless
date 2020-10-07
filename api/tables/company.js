const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('Companies', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.STRING,
        Email: Sequelize.STRING,
        Address: Sequelize.STRING,
        ParentID: Sequelize.BIGINT,
        UserID: Sequelize.BIGINT,
        ShortName: Sequelize.STRING,
        Phone: Sequelize.STRING,
        CityID: Sequelize.STRING,
        Website: Sequelize.STRING,
        Type: Sequelize.INTEGER,
        TimeCreate: Sequelize.NOW,
        StageID: Sequelize.BIGINT,
        AssignID: Sequelize.BIGINT,
        TimeActive: Sequelize.NOW,
        TimeWorking: Sequelize.NOW,
        LastActivity: Sequelize.NOW,
        CountryID: Sequelize.BIGINT,
        Source: Sequelize.STRING,
        ScheduleCharge: Sequelize.STRING,
        Note: Sequelize.STRING,
        Fax: Sequelize.STRING,
        Role: Sequelize.STRING,
        CategoryID: Sequelize.BIGINT,
        CustomerGroup: Sequelize.STRING,
        Relationship: Sequelize.STRING,
    });

    return table;
}