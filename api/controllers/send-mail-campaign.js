const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
const Result = require('../constants/result');
var moment = require('moment');
var database = require('../db');
var mMailResponse = require('../tables/mail-response');
var mMailListDetail = require('../tables/mail-list-detail');
var mMailList = require('../tables/mail-list');
var mMailCampain = require('../tables/mail-campain');
var mContact = require('../tables/contact');
let mAdditionalInformation = require('../tables/additional-infomation');

let mUser = require('../tables/user');
const result = require('../constants/result');
function checkDuplicate(array, elm) {
    var check = false;
    array.forEach(item => {
        if (item === elm) check = true;
    })
    return check;
}

module.exports = {
    getListMailCampaign: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var array = [];
                var mailList = mMailList(db);
                mailList.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' })
                var user = await mUser(db).findOne({
                    where: { ID: body.userID }
                })
                var stt = 0;
                var listContactID = [];
                var listCampaignID = [];
                var contact = await mContact(db).findAll({ where: { CompanyID: body.companyID } });
                contact.forEach(item => {
                    listContactID.push(item.ID);
                })
                var addInf = await mAdditionalInformation(db).findAll({ where: { ContactID: { [Op.in]: listContactID } } });
                addInf.forEach(item => {
                    if (!checkDuplicate(listCampaignID, item.CampaignID)) {
                        listCampaignID.push(item.CampaignID);
                    }
                })
                var stt = 0;
                for (var i = 0; i < listCampaignID.length; i++) {
                    var totalOpen = await mMailResponse(db).count({
                        where: {
                            MailCampainID: listCampaignID[i],
                            Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                        }
                    });
                    var totalUnsubscribe = await mMailResponse(db).count({
                        where: {
                            MailCampainID: listCampaignID[i],
                            Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE
                        }
                    });
                    var totalSend = await mMailResponse(db).count({
                        where: {
                            MailCampainID: listCampaignID[i],
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND
                        }
                    });
                    stt += 1;
                    var addInf = await mAdditionalInformation(db).findAll({
                        where: {
                            [Op.and]: [
                                { CampaignID: listCampaignID[i] },
                                { ContactID: { [Op.in]: listContactID } }
                            ]
                        }
                    })
                    var countEmail = 0;
                    var emailArray = [];
                    addInf.forEach(item => {
                        countEmail += 1;
                        emailArray += item.Email + ', ';
                    })
                    var campain = await mMailCampain(db).findOne({
                        where: {
                            [Op.and]: [
                                { ID: listCampaignID[i] },
                                { type: 'MailList' }
                            ]
                        }
                    })
                    if (campain) {
                        array.push({
                            stt: stt,
                            name: campain.Name ? campain.Name : '',
                            subject: campain.Subject ? campain.Subject : '',
                            mailSend: user.Email,
                            timeCreate: campain.TimeCreate ? campain.TimeCreate : '',
                            emailArray: {
                                totalEmail: countEmail,
                                listEmail: emailArray.substring(0, emailArray.length - 2)
                            },
                            totalOpenings: totalSend ? totalSend : 0,
                            secondOpeners: totalOpen ? totalOpen : 0,
                            numberEmailUnsubscribe: totalUnsubscribe ? totalUnsubscribe : 0,
                        })
                    }
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                var result = {
                    status: Constant.STATUS.FAIL,
                    message: Constant.MESSAGE.DATA_NOT_FOUND,
                }
                res.json(result);
            }
        })
    },
    getListMailMerge: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var array = [];
                var mailList = mMailList(db);
                mailList.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' })
                var user = await mUser(db).findOne({
                    where: { ID: body.userID }
                })
                var stt = 0;
                var listContactID = [];
                var listCampaignID = [];
                var contact = await mContact(db).findAll({ where: { CompanyID: body.companyID } });
                contact.forEach(item => {
                    listContactID.push(item.ID);
                })
                var addInf = await mAdditionalInformation(db).findAll({ where: { ContactID: { [Op.in]: listContactID } } });
                for (var i = 0; i < addInf.length; i++) {
                    var totalOpen = await mMailResponse(db).count({
                        where: {
                            MailCampainID: addInf[i].CampaignID,
                            Type: Constant.MAIL_RESPONSE_TYPE.OPEN
                        }
                    });
                    var totalSend = await mMailResponse(db).count({
                        where: {
                            MailCampainID: addInf[i].CampaignID,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND
                        }
                    });
                    stt += 1;
                    var campain = await mMailCampain(db).findOne({
                        where: {
                            [Op.and]: [
                                { ID: addInf[i].CampaignID },
                                { type: 'MailMerge' }
                            ]
                        }
                    })
                    if (campain) {
                        array.push({
                            stt: stt,
                            mailmergeName: addInf[i].Owner ? addInf[i].Owner : '',
                            dateAndTime: addInf[i].TimeCreate ? addInf[i].TimeCreate : null,
                            email: user.Email,
                            totalOpenings: totalSend ? totalSend : 0,
                            secondOpeners: totalOpen ? totalOpen : 0,
                            status: 'Send',
                            note: addInf[i].Description ? addInf[i].Description : '',
                        })
                    }
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                var result = {
                    status: Constant.STATUS.FAIL,
                    message: Constant.MESSAGE.DATA_NOT_FOUND,
                }
                res.json(result);
            }
        })
    }
}