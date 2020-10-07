const Op = require('sequelize').Op;

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

var mCallComment = require('../tables/call-comment');
var mEmailComment = require('../tables/email-comment');
var mMeetComment = require('../tables/meet-comment');
var mNoteComment = require('../tables/note-comment');

var mCallAssociate = require('../tables/call-associate');
var mEmailAssociate = require('../tables/email-associate');
var mMeetAssociate = require('../tables/meet-associate');
var mNoteAssociate = require('../tables/note-associate');
var mTaskAssociate = require('../tables/task-associate');

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
        call.belongsTo(mUser(db), { foreignKey: ['UserID'], sourceKey: ['UserID'] });
        call.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        call.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
        call.hasMany(mCallComment(db), { foreignKey: 'ActivityID' })
        call.hasMany(mCallAssociate(db), { foreignKey: 'ActivityID' })

        call.findAll({
            where: {
                UserID: body.userID,
                TimeCreate: { [Op.gt]: new Date(moment().valueOf() - 604800000) }
            },
            include: [{
                model: mContact(db),
                required: false
            }, {
                model: mCompany(db),
                required: false
            }, {
                model: mCallComment(db),
                required: false
            }, {
                model: mCallAssociate(db),
                required: false
            }]
        }).then(data => {

            var array = [];
            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: elm.TimeCreate,
                    timeRemind: elm.TimeRemind,
                    timeStart: elm.TimeStart,
                    state: elm.State,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.CALL,
                    listComment: getListCmt(elm.CallComments),

                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",

                    companyID: elm.Company ? elm.Company.ID : -1,
                    companyName: elm.Company ? elm.Company.Name : "",

                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : "",

                    type: elm.Company ? 1 : elm.Contact ? 2 : 0

                })
            });

            res(array);
        })
    })
}

function getListActivityEmail(db, body) {
    return new Promise((res) => {
        var email = mEmail(db);
        email.belongsTo(mUser(db), { foreignKey: ['UserID'], sourceKey: ['UserID'] });
        email.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        email.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
        email.hasMany(mEmailComment(db), { foreignKey: 'ActivityID' })
        email.hasMany(mEmailAssociate(db), { foreignKey: 'ActivityID' })

        email.findAll({
            where: {
                UserID: body.userID,
                TimeCreate: { [Op.gt]: new Date(moment().valueOf() - 604800000) }
            },
            include: [
                {
                    model: mContact(db),
                    required: false
                }, {
                    model: mCompany(db),
                    required: false
                }, {
                    model: mEmailComment(db),
                    required: false
                }, {
                    model: mEmailAssociate(db),
                    required: false
                }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: elm.TimeCreate,
                    timeStart: elm.TimeStart,
                    timeRemind: elm.TimeRemind,
                    state: elm.State,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.EMAIL,
                    listComment: getListCmt(elm.EmailComments),

                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",

                    companyID: elm.Company ? elm.Company.ID : -1,
                    companyName: elm.Company ? elm.Company.Name : "",

                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : "",

                    type: elm.Company ? 1 : elm.Contact ? 2 : 0
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
        meet.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        meet.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
        meet.hasMany(mMeetComment(db), { foreignKey: 'ActivityID' })
        meet.hasMany(mMeetAssociate(db), { foreignKey: 'ActivityID' })

        meet.findAll({
            where: {
                UserID: body.userID,
                TimeCreate: { [Op.gt]: new Date(moment().valueOf() - 604800000) }
            },
            include: [{
                model: mUser(db),
                required: false
            }, {
                model: mCompany(db),
                required: false
            }, {
                model: mMeetComment(db),
                required: false
            }, {
                model: mMeetAssociate(db),
                required: false
            }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: elm.TimeCreate,
                    timeStart: elm.TimeStart,
                    timeRemind: elm.TimeRemind,
                    description: elm.Description,
                    duration: elm.Duration,
                    activityType: Constant.ACTIVITY_TYPE.MEET,
                    listComment: getListCmt(elm.MeetComments),

                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",

                    companyID: elm.Company ? elm.Company.ID : -1,
                    companyName: elm.Company ? elm.Company.Name : "",

                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : "",

                    type: elm.Company ? 1 : elm.Contact ? 2 : 0
                })
            });

            res(array);
        })
    })
}

function getListActivityNote(db, body) {
    return new Promise((res) => {
        var note = mNote(db);
        note.belongsTo(mUser(db), { foreignKey: ['UserID'], sourceKey: ['UserID'] });
        note.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        note.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
        note.hasMany(mNoteComment(db), { foreignKey: 'ActivityID' });
        note.hasMany(mNoteAssociate(db), { foreignKey: 'ActivityID' })

        note.findAll({
            where: {
                UserID: body.userID,
                TimeCreate: { [Op.gt]: new Date(moment().valueOf() - 604800000) }
            },
            include: [{
                model: mContact(db),
                required: false
            }, {
                model: mCompany(db),
                required: false
            }, {
                model: mNoteComment(db),
                required: false
            }, {
                model: mNoteAssociate(db),
                required: false
            }]
        }).then(data => {
            var array = [];

            data.forEach(elm => {
                array.push({
                    id: elm.ID,
                    timeCreate: elm.TimeCreate,
                    timeRemind: elm.TimeRemind,
                    description: elm.Description,
                    activityType: Constant.ACTIVITY_TYPE.NOTE,
                    listComment: getListCmt(elm.NoteComments),

                    contactID: elm.Contact ? elm.Contact.ID : -1,
                    contactName: elm.Contact ? elm.Contact.Name : "",

                    companyID: elm.Company ? elm.Company.ID : -1,
                    companyName: elm.Company ? elm.Company.Name : "",

                    userID: elm.User ? elm.User.ID : -1,
                    userName: elm.User ? elm.User.Name : "",

                    type: elm.Company ? 1 : elm.Contact ? 2 : 0
                })
            });

            res(array);
        })
    })
}

function getListActivityTask(db, body) {
    return new Promise((res) => {

        var task = mTask(db);
        task.belongsTo(mUser(db), { foreignKey: ['UserID'], sourceKey: ['UserID'] });
        task.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
        task.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
        task.belongsTo(mUser(db), { foreignKey: 'AssignID', sourceKey: 'AssignID' });
        task.hasMany(mTaskAssociate(db), { foreignKey: 'ActivityID' })

        task.findAll({
            where: {
                UserID: body.userID,
                TimeCreate: { [Op.gt]: new Date(moment().valueOf() - 604800000) }
            },
            include: [{
                model: mUser(db),
                required: false
            }, {
                model: mContact(db),
                required: false
            }, {
                model: mCompany(db),
                required: false
            }, {
                model: mTaskAssociate(db),
                required: false
            }]
        })
            .then(data => {
                var array = [];

                data.forEach(elm => {
                    array.push({
                        id: elm.ID,
                        timeCreate: elm.TimeCreate,
                        timeRemind: elm.TimeRemind,
                        timeAssign: elm.TimeAssign,
                        timeStart: elm.TimeStart,
                        description: elm.Description,
                        taskType: elm.Type,
                        taskName: elm.Name,
                        assignID: elm.AssignID,
                        activityType: Constant.ACTIVITY_TYPE.TASK,
                        status: elm.Status ? elm.Status : false,
                        listComment: [],

                        contactID: elm.Contact ? elm.Contact.ID : -1,
                        contactName: elm.Contact ? elm.Contact.Name : "",

                        companyID: elm.Company ? elm.Company.ID : -1,
                        companyName: elm.Company ? elm.Company.Name : "",

                        userID: elm.User ? elm.User.ID : -1,
                        userName: elm.User ? elm.User.Name : "",

                        type: elm.Company ? 1 : elm.Contact ? 2 : 0
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

            getListActivityCall(db, body).then(dataCall => {
                let timeOfCall = dataCall.length;

                var array = dataCall;
                getListActivityEmail(db, body).then(dataEmail => {
                    let timeOfEmail = dataEmail.length;

                    array = array.concat(dataEmail);
                    getListActivityMeet(db, body).then(dataMeet => {
                        let timeOfMeet = dataMeet.length;

                        array = array.concat(dataMeet);
                        getListActivityNote(db, body).then(dataNote => {
                            let timeOfNote = dataNote.length;

                            array = array.concat(dataNote);
                            getListActivityTask(db, body).then(dataTask => {
                                let timeOfTask = dataTask.length;

                                array = array.concat(dataTask);

                                array = array.sort((a, b) => {
                                    return b.timeCreate - a.timeCreate
                                });

                                array = array.filter(item => {
                                    return item.type != 0 && item.userID != -1;
                                });

                                let activitySummary = {
                                    call: timeOfCall,
                                    email: timeOfEmail,
                                    meet: timeOfMeet,
                                    note: timeOfNote,
                                    task: timeOfTask
                                }

                                var result = {
                                    status: Constant.STATUS.SUCCESS,
                                    message: '',
                                    array: array,
                                    activitySummary
                                }

                                res.json(result);
                            })
                        })
                    })
                })
            })

        })
    },


}