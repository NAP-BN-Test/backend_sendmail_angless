const Sequelize = require('sequelize');
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');

var mUser = require('../tables/user');
var mContact = require('../tables/contact');

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

var mCallAssociate = require('../tables/call-associate');
var mEmailAssociate = require('../tables/email-associate');
var mMeetAssociate = require('../tables/meet-associate');
var mNoteAssociate = require('../tables/note-associate');
var mTaskAssociate = require('../tables/task-associate');

var mModules = require('../constants/modules')

function getListCmt(listData) {
    var array = [];
    listData.forEach(elm => {
        array.push({
            id: elm['ID'],
            activityID: elm['ActivityID'],
            activityType: elm['activityType'],
            content: elm['Contents'],
            timeCreate: elm['TimeCreate'],
            userName: elm['UserName'],
        })
    })

    return array;
}

function getListActivityCall(db, body) {
    return new Promise((res) => {
        var call = mCall(db);
        call.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        call.hasMany(mCallComment(db), { foreignKey: 'ActivityID' })
        call.hasMany(mCallAssociate(db), { foreignKey: 'ActivityID' })

        call.findAll({
            where: { ContactID: body.contactID },
            include: [{
                model: mContact(db),
                required: false
            }, {
                model: mCallComment(db),
                required: false
            }, {
                model: mCallAssociate(db),
                where: { ContactID: body.contactID },
                required: false
            }]
        }).then(data => {
            var array = [];
            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeStart: mModules.toDatetime(elm.TimeStart),
                    contactID: elm.Contact.ID,
                    contactName: elm.Contact.Name,
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
        email.hasMany(mEmailComment(db), { foreignKey: 'ActivityID' })
        email.hasMany(mEmailAssociate(db), { foreignKey: 'ActivityID' })

        email.findAll({
            where: { ContactID: body.contactID },
            include: [
                {
                    model: mContact(db),
                    required: false
                }, {
                    model: mEmailComment(db),
                    required: false
                }, {
                    model: mEmailAssociate(db),
                    required: false,
                    where: { ContactID: body.contactID }
                }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),
                    timeStart: mModules.toDatetime(elm.TimeStart),

                    contactID: elm.Contact.ID,
                    contactName: elm.Contact.Name,
                    state: elm.State,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.EMAIL,
                    listComment: getListCmt(elm.EmailComments)
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
        meet.hasMany(mMeetAssociate(db), { foreignKey: 'ActivityID' })

        meet.findAll({
            where: { ContactID: body.contactID },
            include: [{
                model: mUser(db),
                required: false
            }, {
                model: mMeetComment(db),
                required: false
            }, {
                model: mMeetAssociate(db),
                required: false,
                where: { ContactID: body.contactID }
            }]
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
                    listComment: getListCmt(elm.MeetComments)
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
        note.hasMany(mNoteAssociate(db), { foreignKey: 'ActivityID' })

        note.findAll({
            where: { ContactID: body.contactID },
            include: [{
                model: mNoteComment(db),
                required: false
            }, {
                model: mNoteAssociate(db),
                required: false,
                where: { ContactID: body.contactID }
            }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: mModules.toDatetime(elm.TimeCreate),
                    timeRemind: mModules.toDatetime(elm.TimeRemind),

                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.NOTE,
                    listComment: getListCmt(elm.NoteComments)
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
        task.hasMany(mTaskAssociate(db), { foreignKey: 'ActivityID' })

        task.findAll({
            where: { ContactID: body.contactID },
            include: [{
                model: mUser(db),
                required: false,
                as: 'CreateUser'
            }, {
                model: mTaskAssociate(db),
                required: false,
                where: { ContactID: body.contactID }
            }]
        })
            .then(data => {
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
    }

}