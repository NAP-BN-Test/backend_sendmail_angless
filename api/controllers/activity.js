const Sequelize = require('sequelize');
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');

var mUser = require('../tables/user');
var mContact = require('../tables/contact');
var mCompany = require('../tables/company');

var mEmail = require('../tables/email');
var mCall = require('../tables/call');
var mMeet = require('../tables/meet');
var mNote = require('../tables/note');
var mTask = require('../tables/task');

var mMeetAttend = require('../tables/meet-attend');

var mCallComment = require('../tables/call-comment');
var mEmailComment = require('../tables/email-comment');
var mMeetComment = require('../tables/meet-comment');
var mNoteComment = require('../tables/note-comment');

var mModules = require('../constants/modules')

function getListCmt(listData) {
    var array = [];
    listData.forEach(elm => {
        array.push({
            id: elm['ID'],
            activityID: elm['ActivityID'],
            activityType: elm['activityType'],
            content: elm['Contents'],
            timeCreate: elm.TimeCreate,
            userName: elm['UserName'],
        })
    })

    return array;
}

function updateActi(listObj, table, id, db) {
    return new Promise(res => {
        let updateObj = {};
        for (let field of listObj) {
            updateObj[field.key] = field.value
        }
        table.update(updateObj, { where: { ID: id } })
            .then(() => {
                table.findOne({ where: { ID: id } }).then(activity => {
                    if (activity) {
                        if (activity.CompanyID) {
                            var company = mCompany(db);
                            company.update({ LastActivity: updateObj.TimeUpdate }, { where: { ID: activity.CompanyID } })
                        }
                        if (activity.ContactID) {
                            var contact = mContact(db);
                            contact.update({ LastActivity: updateObj.TimeUpdate }, { where: { ID: activity.ContactID } })
                        }
                    }
                })

                res(Result.ACTION_SUCCESS);
            }).catch(() => {
                res(Result.SYS_ERROR_RESULT);
            })
    })
}

function getListActivityCall(db, body) {
    return new Promise((res) => {
        var call = mCall(db);
        call.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        call.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID' });
        call.hasMany(mCallComment(db), { foreignKey: 'ActivityID' })

        call.findAll({
            where: { CompanyID: body.companyID },
            include: [
                { model: mContact(db) },
                { model: mCallComment(db) },
                { model: mUser(db), required: false }
            ]
        }).then(data => {
            var array = [];

            data.forEach(elm => {

                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeStart: mModules.toDatetime(elm.TimeStart),
                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",
                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : "",
                    state: elm.State,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.CALL,
                    listComment: getListCmt(elm.CallComments)
                })
            });

            res(array);
        })
    })
}

function getListActivityEmail(db, body) {
    return new Promise((res) => {
        var email = mEmail(db);
        email.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        email.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID' });
        email.hasMany(mEmailComment(db), { foreignKey: 'ActivityID' })

        email.findAll({
            where: { CompanyID: body.companyID },
            include: [
                { model: mContact(db) },
                { model: mEmailComment(db) },
                { model: mUser(db), required: false }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeStart: mModules.toDatetime(elm.TimeStart),
                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",
                    state: elm.State,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.EMAIL,
                    listComment: getListCmt(elm.EmailComments),
                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : ""
                })
            });

            res(array);
        })
    })
}

function getListActivityMeet(db, body) {
    return new Promise((res) => {
        var meet = mMeet(db);
        meet.belongsTo(mUser(db), { foreignKey: ['UserID'], sourceKey: ['UserID'] });
        meet.hasMany(mMeetComment(db), { foreignKey: 'ActivityID' })

        meet.findAll({
            where: Sequelize.or({ CompanyID: body.companyID }),
            include: [{ model: mUser(db) }, { model: mMeetComment(db) }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeStart: mModules.toDatetime(elm.TimeStart),
                    description: elm.Description,
                    duration: elm.Duration,
                    activityType: Constant.ACTIVITY_TYPE.MEET,
                    listComment: getListCmt(elm.MeetComments),
                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : ""
                })
            });

            res(array);
        })
    })
}

function getListActivityNote(db, body) {
    return new Promise((res) => {
        var note = mNote(db);
        note.hasMany(mNoteComment(db), { foreignKey: 'ActivityID' });
        note.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID' });

        note.findAll({
            where: { CompanyID: body.companyID },
            include: [{ model: mNoteComment(db) }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.NOTE,
                    listComment: getListCmt(elm.NoteComments),
                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : ""
                })
            });

            res(array);
        })
    })
}

function getListActivityTask(db, body) {
    return new Promise((res) => {

        var task = mTask(db);
        task.belongsTo(mUser(db), { foreignKey: 'AssignID', sourceKey: 'AssignID', as: 'AssignUser' });
        task.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });

        task.findAll({
            where: { CompanyID: body.companyID },
            include: [{ model: mUser(db), required: false, as: 'CreateUser' }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeAssign: mModules.toDatetime(elm.TimeAssign),
                    timeStart: mModules.toDatetime(elm.TimeStart),
                    description: elm.Description,
                    taskType: elm.Type,
                    taskName: elm.Name,
                    assignID: elm.AssignID,
                    activityType: Constant.ACTIVITY_TYPE.TASK,
                    status: elm.Status ? elm.Status : false,
                    listComment: [],

                    userID: elm.CreateUser ? elm.CreateUser.ID : -1,
                    userName: elm.CreateUser ? elm.CreateUser.Name : ""
                })
            });

            res(array);
        })
    })
}


module.exports = {

    getListActivity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (body.activityType == Constant.ACTIVITY_TYPE.ALL) {
                getListActivityCall(db, body).then(dataCall => {
                    var array = dataCall;
                    getListActivityEmail(db, body).then(dataEmail => {
                        array = array.concat(dataEmail);
                        getListActivityMeet(db, body).then(dataMeet => {
                            array = array.concat(dataMeet);
                            getListActivityNote(db, body).then(dataNote => {
                                array = array.concat(dataNote);
                                getListActivityTask(db, body).then(dataTask => {
                                    array = array.concat(dataTask);

                                    array = array.sort((a, b) => {
                                        return b.timeCreate - a.timeCreate
                                    });

                                    var result = {
                                        status: Constant.STATUS.SUCCESS,
                                        message: '',
                                        array: array
                                    }

                                    res.json(result);
                                })
                            })
                        })
                    })
                })
            } else if (body.activityType == Constant.ACTIVITY_TYPE.CALL) { // type is call
                getListActivityCall(db, body).then(data => {
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: data
                    }

                    res.json(result);
                })
            } else if (body.activityType == Constant.ACTIVITY_TYPE.EMAIL) {
                getListActivityEmail(db, body).then(data => {
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: data
                    }

                    res.json(result);
                })
            } else if (body.activityType == Constant.ACTIVITY_TYPE.MEET) {
                getListActivityMeet(db, body).then(data => {
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: data
                    }

                    res.json(result);
                })
            } else if (body.activityType == Constant.ACTIVITY_TYPE.NOTE) {
                getListActivityNote(db, body).then(data => {
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: data
                    }

                    res.json(result);
                })
            } else if (body.activityType == Constant.ACTIVITY_TYPE.TASK) {
                getListActivityTask(db, body).then(data => {
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: data
                    }

                    res.json(result);
                })
            }
        })
    },

    updateActivity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            console.log(body);

            let update = [];

            if (body.activityType == Constant.ACTIVITY_TYPE.CALL) {
                if (body.contactID)
                    update.push({ key: 'ContactID', value: body.contactID });

                if (body.activityState)
                    update.push({ key: 'State', value: body.activityState });

                if (body.description)
                    update.push({ key: 'Description', value: body.description });

                if (body.timeStart != null) {
                    let date = moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeStart', value: date });
                }
                if (body.timeRemind != null) {
                    let date = moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeRemind', value: date });
                }
                let updateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                update.push({ key: 'TimeUpdate', value: updateTime })

                updateActi(update, mCall(db), body.activityID, db).then(result => {
                    res.json(result)
                });
            }
            else if (body.activityType == Constant.ACTIVITY_TYPE.EMAIL) {
                if (body.contactID)
                    update.push({ key: 'ContactID', value: body.contactID });

                if (body.description)
                    update.push({ key: 'Description', value: body.description });

                if (body.activityState)
                    update.push({ key: 'State', value: body.activityState });

                if (body.timeStart != null) {
                    let date = moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeStart', value: date });
                }
                if (body.timeRemind != null) {
                    let date = moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeRemind', value: date });
                }
                let updateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                update.push({ key: 'TimeUpdate', value: updateTime })

                updateActi(update, mEmail(db), body.activityID, db).then(result => {
                    res.json(result)
                });
            }
            else if (body.activityType == Constant.ACTIVITY_TYPE.MEET) {
                if (body.listAttendID) {
                    mMeetAttend(db).destroy({ where: { MeetID: body.activityID } }).then(() => {
                        let listID = JSON.parse(body.listAttendID);

                        listID.forEach(itm => {
                            mMeetAttend(db).create({ MeetID: body.activityID, UserID: itm })
                        });
                    })
                }
                if (body.duration)
                    update.push({ key: 'Duration', value: body.duration });

                if (body.timeStart != null) {
                    let date = moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeStart', value: date });
                }
                if (body.timeStart != null) {
                    let date = moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeStart', value: date });
                }
                if (body.description)
                    update.push({ key: 'Description', value: body.description });

                let updateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                update.push({ key: 'TimeUpdate', value: updateTime })

                updateActi(update, mMeet(db), body.activityID, db).then(result => {
                    res.json(result)
                });
            }
            else if (body.activityType == Constant.ACTIVITY_TYPE.NOTE) {
                if (body.description)
                    update.push({ key: 'Description', value: body.description });

                let updateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                update.push({ key: 'TimeUpdate', value: updateTime })

                updateActi(update, mNote(db), body.activityID, db).then(result => {
                    res.json(result)
                });
            }
            else if (body.activityType == Constant.ACTIVITY_TYPE.TASK) {
                if (body.assignID)
                    update.push({ key: 'AssignID', value: body.assignID });

                if (body.taskName != null)
                    update.push({ key: 'Name', value: body.taskName });

                if (body.timeStart != null) {
                    let date = moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeStart', value: date });
                }
                if (body.timeAssign != null) {
                    let date = moment(body.timeAssign).format('YYYY-MM-DD HH:mm:ss.SSS');
                    update.push({ key: 'TimeAssign', value: date });
                }
                if (body.taskType)
                    update.push({ key: 'Type', value: body.taskType });

                if (body.description)
                    update.push({ key: 'Description', value: body.description });

                let updateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                update.push({ key: 'TimeUpdate', value: updateTime })

                updateActi(update, mTask(db), body.activityID, db).then(result => {
                    res.json(result)
                });
            }
        })
    },

}