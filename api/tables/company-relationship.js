const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CompanyRelationship', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        CompanyID: Sequelize.BIGINT,
        RelationshipCompanyID: Sequelize.BIGINT,
        Note: Sequelize.STRING,
    });

    return table;
}