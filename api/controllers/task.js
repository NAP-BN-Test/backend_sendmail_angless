const Op = require('sequelize').Op;

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var moment = require('moment');

var user = require('../controllers/user');
var database = require('../db');

var mTask = require('../tables/task');
var mUser = require('../tables/user');
var mContact = require('../tables/contact');
var mCompany = require('../tables/company');
var mAssociate = require('../tables/task-associate');

var rmAssociate = require('../tables/task-associate');

var mModules = require('../constants/modules')


module.exports = {

    createTask: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {



            let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

            mTask(db).create({
                UserID: body.userID,
                CompanyID: body.companyID,
                ContactID: body.contactID,
                AssignID: body.assignID,
                Type: body.taskType,
                Name: body.taskName,
                TimeStart: moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS'),
                TimeAssign: moment(body.timeAssign).format('YYYY-MM-DD HH:mm:ss.SSS'),
                TimeRemind: body.timeRemind ? moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS') : null,
                TimeCreate: now,
                TimeUpdate: now,
                Description: body.description,
            }).then(data => {

                if (body.companyID) {
                    var company = mCompany(db);
                    company.update({ LastActivity: now }, { where: { ID: body.CompanyID } })
                }
                if (body.contactID) {
                    var contact = mContact(db);
                    contact.update({ LastActivity: now }, { where: { ID: body.ContactID } })
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
                    timeAssign: data.TimeAssign,
                    timeStart: data.TimeStart,
                    description: data.Description,
                    taskType: data.Type,
                    taskName: data.Name,
                    assignID: data.AssignID,
                    activityType: Constant.ACTIVITY_TYPE.TASK,
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


            mAssociate(db).findAll({ where: { ActivityID: body.taskID } }).then(data => {
                var array = [];

                data.forEach(elm => {
                    array.push({
                        taskID: elm['ActivityID'],
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
                mAssociate(db).create({ ActivityID: body.taskID, ContactID: body.contactID }).then(data => {
                    res.json(Result.ACTION_SUCCESS)
                })
            } else {
                mAssociate(db).destroy({ where: { ActivityID: body.taskID, ContactID: body.contactID } }).then(data => {
                    res.json(Result.ACTION_SUCCESS)
                })
            }


        })
    },

    getListTask: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            var task = mTask(db);
            task.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'UserCreate' });
            task.belongsTo(mUser(db), { foreignKey: 'AssignID', sourceKey: 'AssignID', as: 'UserAssign' });
            task.belongsTo(mContact(db), { foreignKey: 'ContactID', sourceKey: 'ContactID' });
            task.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });

            user.checkUser(body.ip, body.dbName, body.userID).then(async role => {
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
                task.count({ where: whereAll }).then(all => {
                    task.findAll({
                        where: whereAll,
                        include: [
                            { model: mUser(db), as: 'UserCreate', required: false },
                            { model: mUser(db), as: 'UserAssign', required: false },
                            { model: mContact(db), required: false },
                            { model: mCompany(db), required: false },
                        ],
                        order: [['TimeCreate', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    }).then(data => {
                        var array = [];
                        data.forEach(item => {
                            array.push({
                                id: item.ID,
                                status: item.Status ? item.Status : false,
                                taskName: item.Name,
                                description: item.Description,
                                type: item.Type,
                                timeCreate: mModules.toDatetime(item.TimeCreate),
                                timeRemind: mModules.toDatetime(item.TimeRemind),

                                userID: item.UserCreate.dataValues ? item.UserCreate.ID : -1,
                                userName: item.UserCreate.dataValues ? item.UserCreate.Name : "",
                                createID: item.UserCreate.dataValues ? item.UserCreate.ID : -1,
                                createName: item.UserCreate.dataValues ? item.UserCreate.Username : "",

                                assignID: item.UserAssign.dataValues ? item.UserAssign.ID : -1,
                                assignName: item.UserAssign.dataValues ? item.UserAssign.Username : "",

                                contactID: item.Contact ? item.Contact.ID : -1,
                                contactName: item.Contact ? item.Contact.Name : "",

                                companyID: item.Company ? item.Company.ID : -1,
                                companyName: item.Company ? item.Company.Name : "",

                                type: mModules.taskType(item.Type),
                                activityType: Constant.ACTIVITY_TYPE.TASK
                            });
                        })
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array, all
                        }
                        res.json(result);
                    })
                })
            });

        })
    },

    updateTask: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            if (body.taskIDs) {
                let listTask = JSON.parse(body.taskIDs);
                let listTaskID = [];
                listTask.forEach(item => {
                    listTaskID.push(Number(item + ""));
                });
                mTask(db).update(
                    { Status: body.status ? body.status : false },
                    { where: { ID: { [Op.in]: listTaskID } } }
                ).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                })
            }

        })
    },

    deleteTask: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.activityIDs) {
                let listActivity = JSON.parse(body.activityIDs);
                let listActivityID = [];
                listActivity.forEach(item => {
                    listActivityID.push(Number(item + ""));
                });
                rmAssociate(db).destroy({ where: { ActivityID: { [Op.in]: listActivityID } } }).then(() => {
                    mTask(db).destroy({ where: { ID: { [Op.in]: listActivityID } } }).then(() => {
                        res.json(Result.ACTION_SUCCESS);
                    })
                })
            }


        })
    },

}