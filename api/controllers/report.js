const Result = require('../constants/result');
const Constant = require('../constants/constant');

const Op = require('sequelize').Op;
const sequelize = require('sequelize');

var moment = require('moment');

var database = require('../db');

var cUser = require('../controllers/user');

var mMailList = require('../tables/mail-list');
var mMailListDetail = require('../tables/mail-list-detail');

var mMailCampain = require('../tables/mail-campain');
var mMailResponse = require('../tables/mail-response');

var mUser = require('../tables/user');

var mModules = require('../constants/modules');
const { MAIL_RESPONSE_TYPE } = require('../constants/constant');

/** Xử lý mảng có ngày trùng nhau gộp vào và cộng thêm 1 đơn vị */
function handleArray(array, body, reason) {

    var arraySort = [];

    if (body.timeType == Constant.TIME_TYPE.HOUR) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM-DD HH')
                })
            });
            if (!reason)
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID }
                ]
            else
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID, reason: arrayHandleTime[0].reason }
                ]

            for (let i = 1; i < array.length; i++) {
                if (arrayHandleTime[i].email == arraySort[0].email && arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    if (!reason)
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID })
                    else
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID, reason: arrayHandleTime[i].reason })
                }
            }
            arraySort.forEach(item => {
                item.time = mModules.toDatetimeHour(item.time);
            })
        } else return [];
    } else if (body.timeType == Constant.TIME_TYPE.DAY) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM-DD')
                })
            });
            if (!reason)
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID }
                ]
            else
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID, reason: arrayHandleTime[0].reason }
                ]

            for (let i = 1; i < array.length; i++) {
                if (arrayHandleTime[i].email == arraySort[0].email && arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    if (!reason)
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID })
                    else
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID, reason: arrayHandleTime[i].reason })
                }
            }
            arraySort.forEach(item => {
                item.time = mModules.toDatetimeDay(item.time);
            })
        } else return [];
    } else if (body.timeType == Constant.TIME_TYPE.DATE) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('DD/MM/YYYY')
                })
            });

            if (!reason)
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID }
                ]
            else
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID, reason: arrayHandleTime[0].reason }
                ]

            for (let i = 1; i < array.length; i++) {
                if (arrayHandleTime[i].email == arraySort[0].email && arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    if (!reason)
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID })
                    else
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID, reason: arrayHandleTime[i].reason })
                }
            }
        } else return [];
    } else if (body.timeType == Constant.TIME_TYPE.MONTH) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM')
                })
            });

            if (!reason)
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID }
                ]
            else
                arraySort = [
                    { email: arrayHandleTime[0].email, time: arrayHandleTime[0].time, value: 1, mailListID: arrayHandleTime[0].mailListID, reason: arrayHandleTime[0].reason }
                ]

            for (let i = 1; i < array.length; i++) {
                if (arrayHandleTime[i].email == arraySort[0].email && arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    if (!reason)
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID })
                    else
                        arraySort.unshift({ email: arrayHandleTime[i].email, time: arrayHandleTime[i].time, value: 1, mailListID: arrayHandleTime[i].mailListID, reason: arrayHandleTime[i].reason })
                }
            }
            arraySort.forEach(item => {
                item.time = mModules.toDatetimeMonth(item.time);
            })
        } else return [];
    }
    return arraySort;
}

/** Xử lý mảng có ngày trùng nhau gộp vào và cộng thêm 1 đơn vị trả về mảng dùng cho biểu đồ */
function handleArrayChart(array, body) {

    var arraySort = [];
    var arr = [];

    if (body.timeType == Constant.TIME_TYPE.HOUR) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM-DD HH')
                })
            });

            arraySort = [
                { time: arrayHandleTime[0].time, value: 1 }
            ]

            for (let i = 1; i < arrayHandleTime.length; i++) {
                if (arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    arraySort.unshift({ time: arrayHandleTime[i].time, value: 1 })
                }
            }
        }
        var daies = (parseFloat(((moment.utc(body.timeTo).valueOf() - moment.utc(body.timeFrom).valueOf()) / 3600000) + "").toFixed(0)) - 1;
        for (let i = -Number(daies); i <= 0; i++) {
            let time = moment.utc(body.timeTo).add(i, 'hours').format('YYYY-MM-DD HH');
            let timeFind = arraySort.find(sortItem => {
                return sortItem.time == time;
            });
            if (timeFind) {
                arr.push(timeFind);
            } else {
                arr.push({ time, value: 0 });
            }
        }
        arr.forEach(item => {
            item.time = mModules.toHour(item.time);
        })
    } else if (body.timeType == Constant.TIME_TYPE.DAY) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM-DD')
                })
            });

            arraySort = [
                { time: arrayHandleTime[0].time, value: 1 }
            ]

            for (let i = 1; i < arrayHandleTime.length; i++) {
                if (arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    arraySort.unshift({ time: arrayHandleTime[i].time, value: 1 })
                }
            }
        }

        var daies = (parseFloat(((moment.utc(body.timeTo).valueOf() - moment.utc(body.timeFrom).valueOf()) / 86400000) + "").toFixed(0)) - 2;
        for (let i = -Number(daies); i <= 0; i++) {
            let time = moment.utc().add(i, 'days').format('YYYY-MM-DD');
            let timeFind = arraySort.find(sortItem => {
                return sortItem.time == time;
            });
            if (timeFind) {
                arr.push(timeFind);
            } else {
                arr.push({ time, value: 0 });
            }
        }
        arr.forEach(item => {
            item.time = mModules.toDay(item.time);
        })
    } else if (body.timeType == Constant.TIME_TYPE.DATE) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('DD/MM')
                })
            });

            arraySort = [
                { time: arrayHandleTime[0].time, value: 1 }
            ]

            for (let i = 1; i < arrayHandleTime.length; i++) {
                if (arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    arraySort.unshift({ time: arrayHandleTime[i].time, value: 1 })
                }
            }
        }

        var daies = (parseFloat(((moment.utc(body.timeTo).valueOf() - moment.utc(body.timeFrom).valueOf()) / 86400000) + "").toFixed(0)) - 1;
        for (let i = -Number(daies); i <= 0; i++) {
            let time = moment.utc(body.timeTo).add(i, 'days').format('DD/MM');
            let timeFind = arraySort.find(sortItem => {
                return sortItem.time == time;
            });
            if (timeFind) {
                arr.push(timeFind);
            } else {
                arr.push({ time, value: 0 });
            }
        }
    } else if (body.timeType == Constant.TIME_TYPE.MONTH) {
        if (array.length > 0) {
            var arrayHandleTime = [];
            array.forEach(item => {
                arrayHandleTime.push({
                    id: item.id,
                    email: item.email,
                    reason: item.reason,
                    mailListID: item.mailListID,
                    time: moment.utc(item.time).format('YYYY-MM')
                })
            });

            arraySort = [
                { time: arrayHandleTime[0].time, value: 1 }
            ]

            for (let i = 1; i < arrayHandleTime.length; i++) {
                if (arrayHandleTime[i].time == arraySort[0].time) {
                    arraySort[0].value += 1;
                } else {
                    arraySort.unshift({ time: arrayHandleTime[i].time, value: 1 })
                }
            }
        }

        var daies;
        if (body.timeFrom)
            daies = moment.utc(body.timeTo).months() - moment.utc(body.timeFrom).months()
        else daies = 12;

        for (let i = -Number(daies); i <= 0; i++) {
            let time = moment.utc(body.timeTo).add(i, 'months').format('YYYY-MM');
            let timeFind = arraySort.find(sortItem => {
                return sortItem.time == time;
            });
            if (timeFind) {
                arr.push(timeFind);
            } else {
                arr.push({ time, value: 0 });
            }
        }
        arr.forEach(item => {
            item.time = mModules.toMonth(item.time);
        })
    }
    return arr;
}

/** Xử lý lấy ra lý do nhiều nhất */
function handleReasonUnsubcribe(array) {
    if (array.length > 0) {
        var arraySort = [
            { reason: array[0].reason, value: 1 }
        ]
        for (let i = 1; i < array.length; i++) {
            if (array[i].reason == arraySort[0].reason) {
                arraySort[0].value += 1;
            } else {
                arraySort.unshift({ reason: array[i].reason, value: 1 })
            }
        }
        arraySort = arraySort.sort((a, b) => {
            return b.value - a.value
        });

        return arraySort[0].reason;
    } else return "";
}


module.exports = {

    getListReportByCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                console.log(where);

                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mMailList(db), { foreignKey: 'MailListID' });

                var mailCampainData = await mailCampain.findAll({
                    where: where,
                    include: { model: mMailList(db) },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var mailCampainCount = await mailCampain.count();

                var array = [];
                mailCampainData.forEach(item => {
                    array.push({
                        id: item.ID,
                        name: item.Name,
                        email: item.MailList ? item.MailList.Name : "",
                        createTime: mModules.toDatetime(item.TimeCreate)
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mailCampainCount
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getListReportByMaillist: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mailList = mMailList(db);
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' });

                var mailListData = await mailList.findAll({
                    where: where,
                    include: {
                        model: mMailListDetail(db),
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var mailListCount = await mailList.count();

                var array = [];
                mailListData.forEach(item => {
                    array.push({
                        id: item.ID,
                        name: item.Name,
                        totalEmail: item.MailListDetails.length,
                        createTime: mModules.toDatetime(item.TimeCreate),
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mailListCount
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getReportByCampainSummary: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailCampain.hasOne(mMailResponse(db), { foreignKey: 'MailCampainID' })

                var campainData = await mailCampain.findOne({
                    where: { ID: body.campainID },
                    attributes: ['ID', 'Name', 'Subject', 'TimeCreate', 'MailListID'],
                    include: [{
                        model: mUser(db)
                    }, {
                        model: mMailResponse(db),
                        order: [
                            ['TimeCreate', 'DESC']
                        ],
                    }]
                });

                var totalEmail = await mMailResponse(db).count({
                    where: { MailCampainID: body.campainID },
                    distinct: true,
                    col: 'MailListDetailID'
                });
                var nearestSend = await mMailResponse(db).findOne({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });
                var startSend = await mMailResponse(db).findOne({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    order: [
                        ['TimeCreate', 'ASC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });
                var totalSend = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    }
                });
                var totalOpen = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                    }
                });
                var totalOpenDistinct = await mMailResponse(db).count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });
                var totalClickLink = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK
                    }
                });
                var totalUnsubscribe = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE
                    }
                });
                var listMailListDetailIDData = await mMailResponse(db).findAll({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID
                    },
                    attributes: ['MailListDetailID'],
                    raw: true
                });
                var listMailListDetailID = [];
                if (listMailListDetailIDData.length > 0)
                    listMailListDetailIDData.forEach(listMailListDetailIDItem => {
                        listMailListDetailID.push(Number(listMailListDetailIDItem.MailListDetailID))
                    })
                var totalInvalid = await mMailListDetail(db).count({
                    where: { ID: { [Op.in]: listMailListDetailID } },
                    distinct: true,
                    col: 'Email'
                })

                var obj = {
                    name: campainData.Name,
                    subject: campainData.Subject,
                    totalEmail,
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    startSend: startSend ? startSend.TimeCreate : null,
                    userSend: campainData.User.Name,
                    totalSend,
                    totalOpen,
                    totalClickLink,
                    totalInvalid,
                    totalUnsubscribe,

                    percentType: parseFloat(totalOpenDistinct / totalEmail * 100).toFixed(0) + '%',
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    getReportByCampainMailType: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' });

                var mWhere;
                if (body.timeFrom) {
                    mWhere = {
                        TimeCreate: { [Op.between]: [new Date(moment.utc(body.timeFrom)), new Date(moment.utc(body.timeTo))] },
                        MailCampainID: body.campainID,
                        Type: body.mailType
                    }
                } else {
                    mWhere = {
                        MailCampainID: body.campainID,
                        Type: body.mailType
                    }
                }

                var mailResponseData = await mailResponse.findAll({
                    where: mWhere,
                    attributes: ['ID', 'TimeCreate', 'Reason'],
                    include: {
                        model: mMailListDetail(db),
                        attributes: ['Email']
                    }
                });

                var arrayTable = [];
                mailResponseData.forEach(mailResponseDataItem => {
                    arrayTable.push({
                        id: mailResponseDataItem.ID,
                        time: mailResponseDataItem.TimeCreate,
                        email: mailResponseDataItem.MailListDetail.Email,
                        reason: mailResponseDataItem.Reason ? mailResponseDataItem.Reason : "",
                        mailListID: mailResponseDataItem.MailListDetail.MailListID ?
                            Number(mailResponseDataItem.MailListDetail.MailListID) : -1
                    })
                });

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    if (arrayTable.length > 1) {
                        var arrayUnquie = [arrayTable[0]];

                        arrayTable.forEach(itemTable => {
                            let index = arrayUnquie.findIndex(itemUnquie => {
                                return itemUnquie.email == itemTable.email;
                            });
                            if (index < 0) arrayUnquie.push(itemTable)
                        });
                        arrayTable = arrayUnquie
                    }
                }

                var array = handleArrayChart(arrayTable, body);

                var arrayTableSort = handleArray(arrayTable, body, body.mailType == Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE);

                var totalEmail = await mMailResponse(db).count({ // Tổng số email đã thao tác với chiến dịch mà không trùng nhau
                    where: { MailCampainID: body.campainID },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalTypeDistinct = await mMailResponse(db).count({ // Tổng số email tương ứng với các loại và không trùng nhau
                    where: {
                        MailCampainID: body.campainID,
                        Type: body.mailType
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalType = 0; // tổng số lần cho mỗi loại mail response
                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần
                var mainReason = handleReasonUnsubcribe(arrayTable); // Lý do nhiều nhất nếu là loại unsubscribe

                array.forEach(arrayItem => {
                    totalType = totalType + arrayItem.value;
                    if (arrayItem.value > 1) totalTypeTwice = totalTypeTwice += 1;
                });

                // BC gửi mail
                var nearestSend = await mMailResponse(db).findOne({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });

                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: parseFloat(totalTypeDistinct / totalEmail).toFixed(2), // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getReportByMailListSummary: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailList = mMailList(db);
                mailList.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' })

                var mailListData = await mailList.findOne({
                    where: { ID: body.mailListID },
                    attributes: ['ID', 'Name', 'TimeCreate'],
                    include: [{
                        model: mUser(db)
                    }, {
                        model: mMailListDetail(db),
                        attributes: ['ID']
                    }]
                });

                var totalEmail = mailListData.MailListDetails.length;

                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' })

                var totalSend = await mailResponse.count({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    }
                });
                var totalOpen = await mailResponse.count({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    }
                });
                var totalOpenDistinct = await mailResponse.count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });
                var totalClickLink = await mailResponse.count({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    }
                });
                var totalUnsubscribe = await mailResponse.count({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    }
                });
                var totalInvalid = await mailResponse.count({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var obj = {
                    name: mailListData.Name,
                    totalEmail,
                    userSend: mailListData.User.Name,
                    totalSend,
                    totalOpen,
                    totalClickLink,
                    totalInvalid,
                    totalUnsubscribe,

                    percentType: parseFloat(totalOpenDistinct / totalEmail * 100).toFixed(0) + '%',
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    getReportByMailListType: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' });

                var mWhere;
                if (body.timeFrom) {
                    mWhere = {
                        TimeCreate: { [Op.between]: [new Date(moment.utc(body.timeFrom)), new Date(moment.utc(body.timeTo))] },
                        Type: body.mailType
                    }
                } else {
                    mWhere = {
                        Type: body.mailType
                    }
                }
                var mailResponseData = await mailResponse.findAll({
                    where: mWhere,
                    attributes: ['ID', 'TimeCreate', 'Reason'],
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID },
                        attributes: ['Email']
                    }
                });

                var arrayTable = [];
                mailResponseData.forEach(mailResponseDataItem => {
                    arrayTable.push({
                        id: mailResponseDataItem.ID,
                        time: mailResponseDataItem.TimeCreate,
                        email: mailResponseDataItem.MailListDetail.Email,
                        reason: mailResponseDataItem.Reason ? mailResponseDataItem.Reason : "",
                        mailListID: mailResponseDataItem.MailListDetail.MailListID ?
                            Number(mailResponseDataItem.MailListDetail.MailListID) : -1
                    })
                })

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    if (arrayTable.length > 1) {
                        var arrayUnquie = [arrayTable[0]];

                        arrayTable.forEach(itemTable => {
                            let index = arrayUnquie.findIndex(itemUnquie => {
                                return itemUnquie.email == itemTable.email;
                            });
                            if (index < 0) arrayUnquie.push(itemTable)
                        });
                        arrayTable = arrayUnquie
                    }
                }

                var array = handleArrayChart(arrayTable, body);

                var arrayTableSort = handleArray(arrayTable, body, body.mailType == Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE);

                var totalEmail = await mailResponse.count({ // Tổng số email đã thao tác với chiến dịch mà không trùng nhau
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalTypeDistinct = await mailResponse.count({ // Tổng số email tương ứng với các loại và không trùng nhau
                    where: {
                        Type: body.mailType
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalType = 0; // tổng số lần cho mỗi loại mail response
                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần
                var mainReason = handleReasonUnsubcribe(arrayTable); // Lý do nhiều nhất nếu là loại unsubscribe

                array.forEach(arrayItem => {
                    totalType = totalType + arrayItem.value;
                    if (arrayItem.value > 1) totalTypeTwice = totalTypeTwice += 1;
                });

                // BC gửi mail
                var nearestSend = await mailResponse.findOne({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { MailListID: body.mailListID }
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });

                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: parseFloat(totalTypeDistinct / totalEmail).toFixed(2), // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    getReportByUserSummary: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var user = mUser(db);
                user.hasMany(mMailCampain(db), { foreignKey: 'OwnerID' });
                user.hasMany(mMailList(db), { foreignKey: 'OwnerID' });

                var userData = await user.findOne({
                    where: { ID: body.userID },
                    include: [{
                        model: mMailCampain(db),
                        attributes: ['ID']
                    }, {
                        model: mMailList(db),
                        attributes: ['ID']
                    }]
                })

                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' });

                var totalSend = await mailResponse.count({
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.SEND },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    }
                });
                var totalOpen = await mailResponse.count({
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.OPEN },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    }
                });
                var totalClickLink = await mailResponse.count({
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    }
                });
                var listMailListDetailIDData = await mailResponse.findAll({
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.INVALID },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID },
                    },
                    attributes: ['MailListDetailID'],
                    raw: true
                });
                var listMailListDetailID = [];
                if (listMailListDetailIDData.length > 0)
                    listMailListDetailIDData.forEach(listMailListDetailIDItem => {
                        listMailListDetailID.push(Number(listMailListDetailIDItem.MailListDetailID))
                    })
                var totalInvalid = await mMailListDetail(db).count({
                    where: { ID: { [Op.in]: listMailListDetailID } },
                    distinct: true,
                    col: 'Email'
                })
                var totalUnsubscribe = await mailResponse.count({
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    }
                });
                var totalEmail = await mailResponse.count({ // Tổng số email đã thao tác với chiến dịch mà không trùng nhau
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });
                var totalOpenDistinct = await mailResponse.count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: { Type: Constant.MAIL_RESPONSE_TYPE.OPEN },

                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });
                var nearestSend = await mailResponse.findOne({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });

                var obj = {
                    timeCreate: userData.TimeCreate ? userData.TimeCreate : null,
                    timeLogin: userData.TimeLogin ? userData.TimeLogin : null,
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    totalMailList: userData.MailCampains.length,
                    totalMailCampain: userData.MailCampains.length,
                    totalMailCampainSend: 3,
                    totalSend,
                    totalOpen,
                    totalClickLink,
                    totalInvalid,
                    totalUnsubscribe,
                    percentType: parseFloat(totalOpenDistinct / totalEmail * 100).toFixed(0) + '%',
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    getReportByUserMailType: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' });

                var mWhere;
                if (body.timeFrom) {
                    mWhere = {
                        TimeCreate: { [Op.between]: [new Date(moment.utc(body.timeFrom)), new Date(moment.utc(body.timeTo))] },
                        Type: body.mailType
                    }
                } else {
                    mWhere = {
                        Type: body.mailType
                    }
                }
                var mailResponseData = await mailResponse.findAll({
                    where: mWhere,
                    attributes: ['ID', 'TimeCreate', 'Reason'],
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID },
                        attributes: ['Email']
                    }
                });

                console.log(mailResponseData);


                var arrayTable = [];
                mailResponseData.forEach(mailResponseDataItem => {
                    arrayTable.push({
                        id: mailResponseDataItem.ID,
                        time: mailResponseDataItem.TimeCreate,
                        email: mailResponseDataItem.MailListDetail.Email,
                        reason: mailResponseDataItem.Reason ? mailResponseDataItem.Reason : "",
                        mailListID: mailResponseDataItem.MailListDetail.MailListID ?
                            Number(mailResponseDataItem.MailListDetail.MailListID) : -1
                    })
                })

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    if (arrayTable.length > 1) {
                        var arrayUnquie = [arrayTable[0]];

                        arrayTable.forEach(itemTable => {
                            let index = arrayUnquie.findIndex(itemUnquie => {
                                return itemUnquie.email == itemTable.email;
                            });
                            if (index < 0) arrayUnquie.push(itemTable)
                        });
                        arrayTable = arrayUnquie
                    }
                }



                var array = handleArrayChart(arrayTable, body);

                var arrayTableSort = handleArray(arrayTable, body, body.mailType == Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE);

                var totalEmail = await mailResponse.count({ // Tổng số email đã thao tác với chiến dịch mà không trùng nhau
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalTypeDistinct = await mailResponse.count({ // Tổng số email tương ứng với các loại và không trùng nhau
                    where: {
                        Type: body.mailType
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    distinct: true,
                    col: 'MailListDetailID'
                });

                var totalType = 0; // tổng số lần cho mỗi loại mail response
                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần
                var mainReason = handleReasonUnsubcribe(arrayTable); // Lý do nhiều nhất nếu là loại unsubscribe

                array.forEach(arrayItem => {
                    totalType = totalType + arrayItem.value;
                    if (arrayItem.value > 1) totalTypeTwice = totalTypeTwice += 1;
                });

                // BC gửi mail
                var nearestSend = await mailResponse.findOne({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND
                    },
                    include: {
                        model: mMailListDetail(db),
                        where: { OwnerID: body.userID }
                    },
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    attributes: ['TimeCreate'],
                    raw: true
                });

                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: parseFloat(totalTypeDistinct / totalEmail).toFixed(2), // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },
}