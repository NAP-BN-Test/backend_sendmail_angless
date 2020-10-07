const Sequelize = require('sequelize');
var mUser = require('../tables/user');
var mContact = require('../tables/contact');


module.exports = function (db) {
    var HistoryContact = db.define('HistoryContact', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: Sequelize.BIGINT,
        Date: Sequelize.DATE,
        Description: Sequelize.STRING,
        ContactID: Sequelize.BIGINT,
    });
    HistoryContact.belongsTo(mUser(db), {
        foreignKey: 'UserID', sourceKey: 'UserID'
    });
    HistoryContact.belongsTo(mContact(db), {
        foreignKey: 'ContactID', sourceKey: 'ContactID'
    });

    return HistoryContact;
}
/*The A.hasOne(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the target model (B).

The A.belongsTo(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the source model (A).

The A.hasMany(B) association means that a One-To-Many relationship exists between A and B, with the foreign key being defined in the target model (B).

These three calls will cause Sequelize to automatically add foreign keys to the appropriate models (unless they are already present).

The A.belongsToMany(B, { through: 'C' }) association means that a Many-To-Many relationship exists between A and B, using table C as junction table,
which will have the foreign keys (aId and bId, for example). Sequelize will automatically create this model C (unless it already exists) and
define the appropriate foreign keys on it.*/


