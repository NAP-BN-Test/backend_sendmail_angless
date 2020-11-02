const Result = require('../constants/result');
const Constant = require('../constants/constant');

const Op = require('sequelize').Op;
const Sequelize = require('sequelize');

var moment = require('moment');
let mAdditionalInformation = require('../tables/additional-infomation');
var database = require('../db');

var cUser = require('../controllers/user');

var mMailList = require('../tables/mail-list');
var mMailListDetail = require('../tables/mail-list-detail');

var mMailCampain = require('../tables/mail-campain');
var mMailResponse = require('../tables/mail-response');

var mUser = require('../tables/user');
var mCompanyMailList = require('../tables/company-maillist');
var mMailListCampaign = require('../tables/maillist-campaign');
var mModules = require('../constants/modules');
var mCompany = require('../tables/company');
const { MAIL_RESPONSE_TYPE } = require('../constants/constant');
var mailmergerCampaingn = require('../controllers/mailmerge-campaign');
async function getAllDateAndCountSend(db, typeSearch, type, typesend) {
    var array = [];
    if (typesend === 'Maillist') {
        var response = await mMailResponse(db).findAll({
            where: {
                MaillistID: typeSearch,
                Type: type,
                TypeSend: 'Maillist',
            }
        });
    } else if (typesend === 'user') {
        var response = await mMailResponse(db).findAll({
            where: {
                IDGetInfo: typeSearch,
                Type: type,
            }
        });
    }
    else {
        var response = await mMailResponse(db).findAll({
            where: {
                MailCampainID: typeSearch,
                Type: type,
                TypeSend: 'Mailmerge',
            }
        });
    }
    response.forEach(item => {
        array.push(mModules.toDatetimeDay(moment(item.TimeCreate).subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS')))
    })
    return array
}
async function countValueInArray(value, array) {
    let count = 0;
    array.forEach(element => {
        if (element == value)
            count += 1;
    });
    return count
}
async function checkTimeOfObjDulicate(obj, arrayObj) {
    arrayObj.forEach(item => {
        if (item.time === obj.time) {
            item.value = obj.value
        }
    })
    return arrayObj;
}
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
function convertStringToListObject(string) {
    let result = [];
    let resultArray = [];
    if (string) {
        result = string.split(";")
        result.forEach(item => {
            let resultObj = {};
            resultObj.name = item;
            resultArray.push(resultObj);
        })
    }
    return resultArray;
}
function checkDuplicate(array, elm) {
    var check = false;
    array.forEach(item => {
        if (item === elm) check = true;
    })
    return check;
}
async function handleArrayReturn(arraydate) {
    var arrayNotDuplicant = [];
    arraydate.forEach(item => {
        if (!checkDuplicate(arrayNotDuplicant, item))
            arrayNotDuplicant.push(item)
    })
    let array = [];
    for (var i = 0; i < arrayNotDuplicant.length; i++) {
        let obj = {
            time: arrayNotDuplicant[i].split(',')[0],
            value: await countValueInArray(arrayNotDuplicant[i], arraydate)
        };
        array.push(obj);
    }
    var arrayTemplate = [
        { time: "Thứ 4", value: 0 },
        { time: "Thứ 5", value: 0 },
        { time: "Thứ 6", value: 0 },
        { time: "Thứ 7", value: 0 },
        { time: "Chủ nhật", value: 0 },
        { time: "Thứ 2", value: 0 },
        { time: "Thứ 3", value: 0 },
    ];
    array.forEach(element => {
        checkTimeOfObjDulicate(element, arrayTemplate)
    })
    return arrayTemplate
}

function convertStringToListObject(string) {
    let result = [];
    let resultArray = [];
    if (string) {
        result = string.split(";")
        result.forEach(item => {
            let resultObj = {};
            resultObj.name = item;
            resultArray.push(resultObj);
        })
    }
    return resultArray;
}
module.exports = {
    // mailmerge    
    getListReportByCampain: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mMailList(db), { foreignKey: 'MailListID' });

                var mailCampainData = await mailCampain.findAll({
                    where: {
                        IDGroup1: body.idGroup1,
                    },
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
                        email: '',
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
                var mailList = mMailList(db);
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' });

                var mailListData = await mailList.findAll({
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
                for (var i = 0; i < mailListData.length; i++) {
                    var totalEmail = await mCompanyMailList(db).count({ where: { MailListID: mailListData[i].ID } })
                    array.push({
                        id: mailListData[i].ID,
                        name: mailListData[i].Name,
                        totalEmail: totalEmail,
                        createTime: mModules.toDatetime(mailListData[i].TimeCreate),
                    })
                }
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
    // mailmerge
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
                var totalEmail = 0;
                information = await mailmergerCampaingn.getAdditionalInfomation(db, body.campainID);
                information.forEach(async item => {
                    var arrayEmail = convertStringToListObject(item.Email)
                    totalEmail += arrayEmail.length
                })
                var nearestSend = await mMailResponse(db).findOne({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
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
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
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
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
                    }
                });
                var totalOpen = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        TypeSend: 'Mailmerge',
                    }
                });
                var totalOpenDistinct = await mMailResponse(db).count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        TypeSend: 'Mailmerge',
                    },
                });
                var totalClickLink = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK,
                        TypeSend: 'Mailmerge',
                    }
                });
                var totalUnsubscribe = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        TypeSend: 'Mailmerge',
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                    }
                });
                var listMailListDetailIDData = await mMailResponse(db).findAll({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                        TypeSend: 'Mailmerge',
                    },
                });
                var listMailListDetailID = [];
                if (listMailListDetailIDData.length > 0)
                    listMailListDetailIDData.forEach(listMailListDetailIDItem => {
                        listMailListDetailID.push(Number(listMailListDetailIDItem.MailListDetailID))
                    })
                var totalInvalid = await mMailResponse(db).count({
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                        TypeSend: 'Mailmerge',
                    }
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

                    percentType: parseFloat((totalOpenDistinct / totalEmail) > 1 ? 1 : (totalOpenDistinct / totalEmail) * 100).toFixed(0) + '%',
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

                var totalEmail = await mCompanyMailList(db).count({
                    where: { MailListID: body.mailListID }
                });
                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' })

                var totalSend = await mMailResponse(db).count({
                    where: {
                        MaillistID: body.mailListID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Maillist',
                    }
                });
                var totalOpen = await mailResponse.count({
                    where: {
                        MaillistID: body.mailListID,
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        TypeSend: 'Maillist',
                    },
                });
                var totalOpenDistinct = await mailResponse.count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                    },
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
                        MaillistID: body.mailListID,
                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                        TypeSend: 'Maillist',
                    },
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

                    percentType: parseFloat((totalOpenDistinct / totalEmail) > 1 ? 1 : (totalOpenDistinct / totalEmail) * 100).toFixed(0) + '%',
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
    // ----------------------------------------------------------------------------------------------------------------------------
    // mailmerge
    getReportByCampainMailType: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailListDetail(db), { foreignKey: 'MailListDetailID' });
                var totalEmail = 0;
                let arraydate = []
                information = await mailmergerCampaingn.getAdditionalInfomation(db, body.campainID);
                if (body.mailType == MAIL_RESPONSE_TYPE.SEND) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MailCampainID: body.campainID,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                            TypeSend: 'Mailmerge',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.campainID, Constant.MAIL_RESPONSE_TYPE.SEND, 'MailMerge');
                }
                if (body.mailType == MAIL_RESPONSE_TYPE.OPEN) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MailCampainID: body.campainID,
                            Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                            TypeSend: 'Mailmerge',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.campainID, Constant.MAIL_RESPONSE_TYPE.OPEN, 'MailMerge');

                }
                if (body.mailType == MAIL_RESPONSE_TYPE.CLICK_LINK) {
                    var totalType = 0
                    arraydate = await getAllDateAndCountSend(db, body.campainID, Constant.MAIL_RESPONSE_TYPE.OPEN, 'MailMerge');
                }

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MailCampainID: body.campainID,
                            Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                            TypeSend: 'Mailmerge',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.campainID, Constant.MAIL_RESPONSE_TYPE.INVALID, 'MailMerge');
                }
                var nearestSend = await mMailResponse(db).findOne(
                    {
                        order: [
                            Sequelize.literal('max(TimeCreate) DESC'),
                        ],
                        group: ['MailListDetailID', 'MailCampainID', 'ID', 'Type', 'Reason', 'CompanyID', 'TypeSend', 'MaillistID', 'TimeCreate', 'IDGetInfo'],
                    }, {
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
                    }
                });
                var arrayTableSort = [];
                information.forEach(async item => {
                    var arrayEmail = convertStringToListObject(item.Email)
                    totalEmail += arrayEmail.length
                    if (item)
                        arrayEmail.forEach(email => {
                            arrayTableSort.push({
                                email: email.name,
                                mailListID: -1,
                                time: mModules.toDatetimeDay(nearestSend.TimeCreate),
                                value: totalType ? totalType : 0
                            })
                        })
                })
                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần

                var nearestSend = await mMailResponse(db).findOne(
                    {
                        order: [
                            Sequelize.literal('max(TimeCreate) DESC'),
                        ],
                        group: ['MailListDetailID', 'MailCampainID', 'ID', 'Type', 'Reason', 'CompanyID', 'TypeSend', 'MaillistID', 'TimeCreate', 'IDGetInfo'],
                    }, {
                    where: {
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
                    }
                });
                var mainReason = nearestSend.Reason ? nearestSend.Reason : 'Không xác định';
                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: (parseFloat((totalType / totalEmail) > 1 ? 1 : (totalType / totalEmail)) * 100).toString() + '%', // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }
                var array = await handleArrayReturn(arraydate);
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort,
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
                var totalEmail = await mCompanyMailList(db).count({
                    where: { MailListID: body.mailListID }
                });
                let arraydate = []
                if (body.mailType == MAIL_RESPONSE_TYPE.SEND) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MaillistID: body.mailListID,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                            TypeSend: 'Maillist',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.mailListID, Constant.MAIL_RESPONSE_TYPE.SEND, 'Maillist');
                }
                if (body.mailType == MAIL_RESPONSE_TYPE.OPEN) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MaillistID: body.mailListID,
                            Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                            TypeSend: 'Maillist',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.mailListID, Constant.MAIL_RESPONSE_TYPE.OPEN, 'Maillist');
                }
                if (body.mailType == MAIL_RESPONSE_TYPE.CLICK_LINK) {
                    var totalType = 0
                    arraydate = await getAllDateAndCountSend(db, body.mailListID, Constant.MAIL_RESPONSE_TYPE.OPEN, 'Maillist');
                }

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            MaillistID: body.mailListID,
                            Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                            TypeSend: 'Maillist',
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.mailListID, Constant.MAIL_RESPONSE_TYPE.INVALID, 'Maillist');
                }

                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần

                var nearestSend = await mMailResponse(db).findOne(
                    {
                        order: [
                            Sequelize.literal('max(TimeCreate) DESC'),
                        ],
                        group: ['MailListDetailID', 'MailCampainID', 'ID', 'Type', 'Reason', 'CompanyID', 'TypeSend', 'MaillistID', 'TimeCreate', 'IDGetInfo'],
                    }, {
                    where: {
                        MaillistID: body.mailListID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Maillist',

                    }
                });
                var mainReason = nearestSend.Reason ? nearestSend.Reason : 'Không xác định';
                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: (parseFloat((totalType / totalEmail) > 1 ? 1 : (totalType / totalEmail)) * 100).toString() + '%', // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }
                var array = await handleArrayReturn(arraydate);
                var arrayTableSort = [];
                let listCompany = await mCompanyMailList(db).findAll({ where: { MailListID: body.mailListID } })
                for (var i = 0; i < listCompany.length; i++) {
                    await mCompany(db).findOne({ where: { ID: listCompany[i].CompanyID } }).then(data => {
                        arrayTableSort.push({
                            email: data.Email,
                            mailListID: -1,
                            time: mModules.toDatetimeDay(nearestSend.TimeCreate),
                            value: totalType ? totalType : 0
                        })
                    })
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort,
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
                    where: [
                        { Type: Constant.MAIL_RESPONSE_TYPE.SEND },
                        { IDGetInfo: body.userID },
                    ]
                });
                var totalOpen = await mailResponse.count({
                    where: [
                        { IDGetInfo: body.userID },
                        { Type: Constant.MAIL_RESPONSE_TYPE.OPEN }
                    ],
                });
                var totalClickLink = await mailResponse.count({
                    where: [
                        { IDGetInfo: body.userID },
                        { Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK }
                    ],
                });
                var listMailListDetailIDData = await mailResponse.findAll({
                    where: [
                        { IDGetInfo: body.userID },
                        { Type: Constant.MAIL_RESPONSE_TYPE.INVALID }
                    ],
                });
                var listMailListDetailID = [];
                if (listMailListDetailIDData.length > 0)
                    listMailListDetailIDData.forEach(listMailListDetailIDItem => {
                        listMailListDetailID.push(Number(listMailListDetailIDItem.MailListDetailID))
                    })
                var totalInvalid = await mailResponse.count({
                    where: [
                        { IDGetInfo: body.userID },
                        { Type: Constant.MAIL_RESPONSE_TYPE.INVALID }
                    ],
                })
                var totalUnsubscribe = await mailResponse.count({
                    where: [
                        { IDGetInfo: body.userID },
                        { Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE }
                    ],
                });
                var totalEmail = await mailResponse.count({ // Tổng số email đã thao tác với chiến dịch mà không trùng nhau
                    where: [
                        { IDGetInfo: body.userID }
                    ],
                });
                var totalOpenDistinct = await mailResponse.count({ // Tổng số email được mở bởi mỗi email và không trùng nhau
                    where: [
                        { IDGetInfo: body.userID }
                    ],
                });
                var nearestSend = await mailResponse.findOne({
                    order: [
                        Sequelize.literal('max(TimeCreate) DESC'),
                    ],
                    group: ['CompanyID', 'Reason', 'ID', 'Type', 'MailCampainID', 'MailListDetailID', 'TimeCreate', 'TypeSend', 'MaillistID', 'IDGetInfo'],
                    where: { IDGetInfo: body.userID }
                });
                var totalMailCampainSend = 0;
                var totalList = [];
                await mailResponse.findAll({
                    where: { IDGetInfo: body.userID }
                }).then(data => {
                    if (data.length > 0) {
                        data.forEach(item => {
                            if (!checkDuplicate(totalList, item.MailCampainID)) {
                                totalList.push(item.MailCampainID);
                                totalMailCampainSend += 1;
                            }
                        })
                    }
                })
                var obj = {
                    timeCreate: userData.TimeCreate ? userData.TimeCreate : null,
                    timeLogin: userData.TimeLogin ? userData.TimeLogin : null,
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    totalMailList: userData.MailCampains.length,
                    totalMailCampain: userData.MailCampains.length,
                    totalMailCampainSend: totalMailCampainSend,
                    totalSend,
                    totalOpen,
                    totalClickLink,
                    totalInvalid,
                    totalUnsubscribe,
                    percentType: parseFloat((totalOpenDistinct / totalEmail) > 1 ? 1 : (totalOpenDistinct / totalEmail) * 100).toFixed(0) + '%',
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
                var listIDMailList = [];
                var arraydate = [];
                if (body.mailType == MAIL_RESPONSE_TYPE.SEND) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            IDGetInfo: body.userID,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.userID, Constant.MAIL_RESPONSE_TYPE.SEND, 'user');
                }
                if (body.mailType == MAIL_RESPONSE_TYPE.OPEN) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            IDGetInfo: body.userID,
                            Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.userID, Constant.MAIL_RESPONSE_TYPE.OPEN, 'user');
                }
                if (body.mailType == MAIL_RESPONSE_TYPE.CLICK_LINK) {
                    var totalType = 0
                    arraydate = []
                }

                if (body.mailType == MAIL_RESPONSE_TYPE.INVALID || body.mailType == MAIL_RESPONSE_TYPE.UNSUBSCRIBE) {
                    var totalType = await mMailResponse(db).count({
                        where: {
                            IDGetInfo: body.userID,
                            Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                        }
                    });
                    arraydate = await getAllDateAndCountSend(db, body.userID, Constant.MAIL_RESPONSE_TYPE.INVALID, 'user');
                }
                await mMailCampain(db).findAll({
                    where: { OwnerID: body.userID },
                }).then(async data => {
                    for (var i = 0; i < data.length; i++) {
                        var mailListCampaign = await mMailListCampaign(db).findAll({ where: { MailCampainID: data[i].ID } })
                        mailListCampaign.forEach(item => {
                            listIDMailList.push(item.MailListID);
                        })
                    }
                })
                // Tổng số mail list
                var totalEmail = await mCompanyMailList(db).count({
                    where: { MailListID: { [Op.in]: listIDMailList } }
                });
                var arrayTableSort = [];
                var listCompanyID = [];
                // tổng số mail merge
                var valueMailmerge = await mMailResponse(db).count({
                    where: {
                        IDGetInfo: body.userID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Mailmerge',
                    }
                });
                await mAdditionalInformation(db).findAll({ where: { UserID: body.userID } }).then(data => {
                    data.forEach(item => {
                        var listMail = convertStringToListObject(item.Email);
                        totalEmail += listMail.length;
                        listMail.forEach(element => {
                            arrayTableSort.push({
                                email: element.name,
                                mailListID: -1,
                                time: mModules.toDatetimeDay(item.TimeCreate),
                                value: valueMailmerge ? valueMailmerge : 0
                            })
                        })
                    })
                })
                await mCompanyMailList(db).findAll({
                    where: { MailListID: { [Op.in]: listIDMailList } }
                }).then(data => {
                    data.forEach(item => {
                        listCompanyID.push(item.CompanyID)
                    })
                })
                var nearestSend = await mMailResponse(db).findOne(
                    {
                        order: [
                            Sequelize.literal('max(TimeCreate) DESC'),
                        ],
                        group: ['MailListDetailID', 'MailCampainID', 'ID', 'Type', 'Reason', 'CompanyID', 'TypeSend', 'MaillistID', 'TimeCreate', 'IDGetInfo'],
                    }, {
                    where: {
                        IDGetInfo: body.userID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                    }
                });
                var valueMaillist = await mMailResponse(db).count({
                    where: {
                        IDGetInfo: body.userID,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Maillist',
                    }
                });
                await mCompany(db).findAll({
                    where: { ID: { [Op.in]: listCompanyID } }
                }).then(data => {
                    data.forEach(item => {
                        arrayTableSort.push({
                            email: item.Email,
                            mailListID: -1,
                            time: mModules.toDatetimeDay(item.TimeCreate),
                            value: valueMaillist ? valueMaillist : 0
                        })
                    })
                })
                var totalTypeTwice = 0; // tổng số loại mail response thao tác trên 2 lần
                var array = await handleArrayReturn(arraydate);
                var mainReason = nearestSend.Reason ? nearestSend.Reason : 'Không xác định';
                var obj = {
                    totalEmail,
                    totalType,
                    totalTypeTwice,
                    advangeType: (parseFloat((totalType / totalEmail) > 1 ? 1 : (totalType / totalEmail)) * 100).toString() + '%', // tỉ lệ là số mail response / tổng số email của chiến dịch
                    nearestSend: nearestSend ? nearestSend.TimeCreate : null,
                    mainReason
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    obj,
                    arrayTableSort,
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