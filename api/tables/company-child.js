const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('CompaniesChilds', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        ParentID: Sequelize.BIGINT,
        ChildID: Sequelize.BIGINT
    });

    return table;
}