const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var moment = require('moment');

var mMailResponse = require('../tables/mail-response');
var mMailListDetail = require('../tables/mail-list-detail');
var mCompany = require('../tables/company');
var mContact = require('../tables/contact');
var ctlAmazon = require('../controllers/amazon');
function convertStringToListObjectEmail(string) {
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
async function checkUnsubsctibe(db, email) {
    let check = false
    console.log(email);
    let mail = await mMailResponse(db).findOne({
        where: {
            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
            Email: email,
        }
    })
    if (mail) {
        check = true
    }
    return check
}

module.exports = {
    unSubscribe: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                if (body.typeSend === 'Maillist') {
                    var responeExits = await mMailResponse(db).findOne({
                        where: {
                            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                            TypeSend: body.typeSend,
                            MaillistID: body.campainID,
                            IDGetInfo: body.idGetInfo,
                            Email: body.email,
                        }
                    })
                    if (responeExits) {
                        await mMailResponse(db).update({
                            Reason: body.reason,
                        }, { where: { ID: responeExits.ID } })
                    } else {
                        await mMailResponse(db).create({
                            TimeCreate: now,
                            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                            TypeSend: body.typeSend,
                            MaillistID: body.campainID,
                            IDGetInfo: body.idGetInfo,
                            Email: body.email,
                            Reason: body.reason,
                        })
                    }
                } else {
                    var responeExits = await mMailResponse(db).findOne({
                        where: {
                            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                            TypeSend: body.typeSend,
                            MailCampainID: body.campainID,
                            IDGetInfo: body.idGetInfo,
                            Email: body.email,
                        }
                    })
                    if (responeExits) {
                        await mMailResponse(db).update({
                            Reason: body.reason,
                        }, { where: { ID: responeExits.ID } })
                    } else {
                        await mMailResponse(db).create({
                            TimeCreate: now,
                            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                            TypeSend: body.typeSend,
                            MailCampainID: body.campainID,
                            IDGetInfo: body.idGetInfo,
                            Email: body.email,
                            Reason: body.reason,
                        })
                    }
                }
                res.json('Success');
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    getListAddressbookUnsubscribe: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let array = []
                let whereObj = {}
                let arraySearchAnd = [];
                let arraySearchOr = [];
                let arraySearchNot = [];
                if (body.dataSearch) {
                    var data = JSON.parse(body.dataSearch)
                    if (data.search) {
                        where = {
                            [Op.or]: [
                                {
                                    Name: {
                                        [Op.like]: '%' + data.search + '%'
                                    }
                                },
                                {
                                    Address: {
                                        [Op.like]: '%' + data.search + '%'
                                    }
                                },
                                {
                                    ID: {
                                        [Op.like]: '%' + data.search + '%'
                                    }
                                },
                                {
                                    Email: {
                                        [Op.like]: '%' + data.search + '%'
                                    }
                                },
                            ]
                        };
                    } else {
                        where = [{
                            ID: {
                                [Op.ne]: null
                            }
                        },];
                    }
                    whereObj[Op.and] = where
                    if (data.items) {
                        for (var i = 0; i < data.items.length; i++) {
                            let userFind = {};
                            if (data.items[i].fields['name'] === 'Address') {
                                userFind['Address'] = {
                                    [Op.like]: '%' + data.items[i]['searchFields'] + '%'
                                }
                                if (data.items[i].conditionFields['name'] == 'And') {
                                    arraySearchAnd.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Or') {
                                    arraySearchOr.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Not') {
                                    arraySearchNot.push(userFind)
                                }
                            }
                            if (data.items[i].fields['name'] === 'Addressbook') {
                                userFind['Name'] = {
                                    [Op.like]: '%' + data.items[i]['searchFields'] + '%'
                                }
                                if (data.items[i].conditionFields['name'] == 'And') {
                                    arraySearchAnd.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Or') {
                                    arraySearchOr.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Not') {
                                    arraySearchNot.push(userFind)
                                }
                            }
                            if (data.items[i].fields['name'] === 'Email') {
                                userFind['Email'] = {
                                    [Op.like]: '%' + data.items[i]['searchFields'] + '%'
                                }
                                if (data.items[i].conditionFields['name'] == 'And') {
                                    arraySearchAnd.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Or') {
                                    arraySearchOr.push(userFind)
                                }
                                if (data.items[i].conditionFields['name'] == 'Not') {
                                    arraySearchNot.push(userFind)
                                }
                            }
                        }
                        if (arraySearchOr.length > 0)
                            whereObj[Op.or] = arraySearchOr
                        if (arraySearchAnd.length > 0)
                            whereObj[Op.and] = arraySearchAnd
                        if (arraySearchNot.length > 0)
                            whereObj[Op.not] = arraySearchNot
                    }

                }
                await mCompany(db).findAll({
                    order: [['ID', 'DESC']],
                    // offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    // limit: Number(body.itemPerPage),
                    where: whereObj,
                }).then(async companyFind => {
                    for (let com = 0; com < companyFind.length; com++) {
                        let check = await checkUnsubsctibe(db, companyFind[com].Email)
                        let status = 'Subcribe'
                        if (check == true) {
                            status = 'Unsubcribe'
                            array.push({
                                addressbookID: companyFind[com].ID,
                                name: companyFind[com].Name ? companyFind[com].Name : '',
                                address: companyFind[com].Address ? companyFind[com].Address : '',
                                email: companyFind[com].Email ? companyFind[com].Email : '',
                                status: status,
                            })
                        }
                        await mContact(db).findAll({
                            where: {
                                CompanyID: companyFind[com].ID,
                            },
                            order: [['ID', 'DESC']],
                        }).then(async contact => {
                            for (let con = 0; con < contact.length; con++) {
                                let arrayEmail = await convertStringToListObjectEmail(contact[con].Email)
                                for (let em = 0; em < arrayEmail.length; em++) {
                                    let check = await checkUnsubsctibe(db, arrayEmail[em].name)
                                    let status = 'Subcribe'
                                    if (check == true) {
                                        status = 'Unsubcribe'
                                        array.push({
                                            addressbookID: companyFind[com].ID,
                                            name: companyFind[com].Name ? companyFind[com].Name : '',
                                            address: companyFind[com].Address ? companyFind[com].Address : '',
                                            email: arrayEmail[em].name ? arrayEmail[em].name : '',
                                            status: status,
                                        })
                                    }
                                }
                            }
                        })
                    }
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                    all: await mCompany(db).count({ where: whereObj })
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
    subscribe: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                body.emailArray = JSON.parse(body.emailArray)
                for (let email = 0; email < body.emailArray.length; email++) {
                    let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                    await mMailResponse(db).update({ Type: null }, {
                        where: { Email: body.emailArray[email] }
                    })
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: 'Thao tác thành công',
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    sendMail: async (req, res) => {
        let body = req.body;
        console.log(body);
        await ctlAmazon.sendEmail(body.emailSend, body.emailRecive, body.subject, body.body, [])
        // var result = {
        //     status: Constant.STATUS.SUCCESS,
        //     message: 'Thao tác thành công',
        // }
        // res.json(result);
    },
}