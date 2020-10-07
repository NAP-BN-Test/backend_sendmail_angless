const Op = require('sequelize').Op;

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var moment = require('moment');

var user = require('../controllers/user');
var database = require('../db');

var mNote = require('../tables/note');
var mAssociate = require('../tables/note-associate');
var mComment = require('../tables/note-comment');

var rmAssociate = require('../tables/note-associate');
var rmComment = require('../tables/note-comment');

var mUser = require('../tables/user');
var mContact = require('../tables/contact');
var mCompany = require('../tables/company');

var mModules = require('../constants/modules')


module.exports = {

    createNote: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {



            let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

            mNote(db).create({
                UserID: body.userID,
                CompanyID: body.companyID,
                ContactID: body.contactID,
                Description: body.description,
                TimeRemind: body.timeRemind ? body.timeRemind : null,
                TimeCreate: now,
                TimeUpdate: now,
            }).then(data => {

                if (body.companyID) {
                    var company = mCompany(db);
                    company.update({ LastActivity: now }, { where: { ID: body.companyID } })
                }
                if (body.contactID) {
                    var contact = mContact(db);
                    contact.update({ LastActivity: now }, { where: { ID: body.contactID } })
                }

                if (body.listAssociate) {
                    let list = JSON.parse(body.listAssociate);
                    list.forEach(itm => {
                        mAssociate(db).create({ ActivityID: data.ID, ContactID: itm });
                    });
                }
                var obj = {
                    id: data.ID,
                    timeCreate: data.TimeCreate,
                    timeRemind: data.TimeRemind,
                    description: data.Description,
                    activityType: Constant.ACTIVITY_TYPE.NOTE,
                    listComment: []
                };

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj
                }

                res.json(result);
            })


        })
    },

    getAssociate: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mAssociate(db).findAll({ where: { ActivityID: body.noteID } }).then(data => {
                var array = [];

                data.forEach(elm => {
                    array.push({
                        noteID: elm['ActivityID'],
                        contactID: elm['ContactID']
                    })
                });

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array
                }

                res.json(result);
            })


        })
    },

    updateAssociate: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.state == Constant.STATUS.SUCCESS) {
                mAssociate(db).create({ ActivityID: body.noteID, ContactID: body.contactID }).then(data => {
                    res.json(Result.ACTION_SUCCESS)
                })
            } else {
                mAssociate(db).destroy({ where: { ActivityID: body.noteID, ContactID: body.contactID } }).then(data => {
                    res.json(Result.ACTION_SUCCESS)
                })
            }


        })
    },

    getListNote: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            var note = mNote(db);
            note.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID' });
            note.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
            note.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });

            note.hasMany(mComment(db), { foreignKey: 'ActivityID', as: 'Comments' });

            user.checkUser(body.ip, body.dbName, body.userID).then(role => {

                let userFind = [];
                if (body.userIDFind) {
                    userFind.push({ UserID: body.userIDFind })
                }
                if (role != Constant.USER_ROLE.MANAGER) {
                    userFind.push({ UserID: body.userID })
                }

                let whereAll;
                if (body.timeFrom) {
                    if (body.timeType == 2) {
                        whereAll = {
                            TimeRemind: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        };
                    } else {
                        whereAll = {
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        };
                    }
                } else {
                    whereAll = {
                        [Op.and]: userFind
                    };
                }

                note.count({ where: whereAll }).then(all => {
                    note.findAll({
                        where: whereAll,
                        include: [
                            { model: mUser(db), required: false },
                            { model: mContact(db), required: false },
                            { model: mCompany(db), required: false },
                            { model: mComment(db), required: false, as: 'Comments' }
                        ],
                        order: [['TimeCreate', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    }).then(data => {
                        let array = [];
                        if (data) {
                            data.forEach(item => {
                                array.push({
                                    id: item.ID,
                                    description: item.Description,
                                    timeCreate: mModules.toDatetime(item.TimeCreate),
                                    timeRemind: mModules.toDatetime(item.TimeRemind),

                                    createID: item.User.dataValues ? item.User.ID : -1,
                                    createName: item.User.dataValues ? item.User.Username : "",

                                    contactID: item.Contact ? item.Contact.ID : -1,
                                    contactName: item.Contact ? item.Contact.Name : "",

                                    companyID: item.Company ? item.Company.ID : -1,
                                    companyName: item.Company ? item.Company.Name : "",

                                    type: item.Company ? 1 : item.Contact ? 2 : 0,
                                    activityType: Constant.ACTIVITY_TYPE.NOTE,

                                    comment: item.Comments.length > 0 ? item.Comments[0].Contents : ""

                                });
                            });

                            var result = {
                                status: Constant.STATUS.SUCCESS,
                                message: '',
                                array, all
                            }

                            res.json(result);
                        }
                    })
                })
            });



        })
    },

    deleteNote: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.activityIDs) {
                let listActivity = JSON.parse(body.activityIDs);
                let listActivityID = [];
                listActivity.forEach(item => {
                    listActivityID.push(Number(item + ""));
                });
                rmAssociate(db).destroy({ where: { ActivityID: { [Op.in]: listActivityID } } }).then(() => {
                    rmComment(db).destroy({ where: { ActivityID: { [Op.in]: listActivityID } } }).then(() => {
                        mNote(db).destroy({ where: { ID: { [Op.in]: listActivityID } } }).then(() => {
                            res.json(Result.ACTION_SUCCESS);
                        })
                    })
                })
            }


        })
    },


}