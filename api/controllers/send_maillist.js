let mAdditionalInformation = require('../tables/additional-infomation');
let mTemplate = require('../tables/template');
var mMailListDetail = require('../tables/mail-list-detail');
var mMailList = require('../tables/mail-list');
var mMailCampain = require('../tables/mail-campain');
var database = require('../db');
const Result = require('../constants/result');
var mCheckMail = require('../controllers/check-mail');
var mAmazon = require('../controllers/amazon');
var mailmergerCampaingn = require('../controllers/mailmerge-campaign');
var fs = require('fs');
var moment = require('moment');
var mModules = require('../constants/modules')
const Constant = require('../constants/constant');
var mUser = require('../tables/user');
var mMailResponse = require('../tables/mail-response');


// var base64Img = require('base64-img');
// const sgMail = require('@sendgrid/mail');
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer.from(bitmap).toString("base64");
}

const result = require('../constants/result');

function getDataInformation(db, ID) {
    var result = mAdditionalInformation(db).findOne({
        where: { ID: ID },
    })
    return result
}

function handleReplaceText(text, listKey, obj_information) {
    var result = text;
    listKey.forEach(item => {
        if (item === 'DateSend') {
            let now = moment().format('YYYY-MM-DD');
            var re = RegExp('&lt;&lt;' + item + '&gt;&gt;', 'g');
            result = result.replace(re, now)
        }
        if (item === 'PAT' || item === 'PriorTrademark') {
            var re = RegExp('&lt;&lt;' + item + '&gt;&gt;', 'g');
            if (obj_information[item]) {
                result = result.replace(re, `<img src="${obj_information[item]}" height="250px" width="500px"/>`);
            } else {
                result = result.replace(re, obj_information[item] ? obj_information[item] : '');
            }
        } else {
            var re = RegExp('&lt;&lt;' + item + '&gt;&gt;', 'g');
            result = result.replace(re, obj_information[item] ? obj_information[item] : '');
        }

    })
    return result;
}
async function handlePushDataToBody(text, infID, db) {
    const re = RegExp('&lt;&lt;(.*?)&gt;&gt;', 'g');
    const keyField = []
    while ((matches = re.exec(text)) !== null) {
        keyField.push(matches[1]);
    }
    let obj_information = await getDataInformation(db, infID);
    var result = handleReplaceText(text, keyField, obj_information.dataValues);
    return result
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
var mConfigEmailSend = require('../tables/config-mail-send')

module.exports = {
    sendMailList: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            await mMailResponse(db).create({
                MailCampainID: body.CampaignID,
                TimeCreate: now,
                Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                TypeSend: 'Mailmerge',
                IDGetInfo: body.userID,
            })
            var information = [];
            campaign = await mMailCampain(db).findOne({
                where: {
                    ID: body.CampaignID,
                }
            })
            if (body.typeSend == 'Send') {
                template = await mTemplate(db).findOne({
                    where: {
                        ID: campaign.TemplateID,
                    }
                })
            } else {
                template = await mTemplate(db).findOne({
                    where: {
                        ID: campaign.IDTemplateReminder,
                    }
                })
            }

            information = await mailmergerCampaingn.getAdditionalInfomation(db, body.CampaignID, 1, 10000);
            await mMailCampain(db).update({
                StatusCampaign: true,
            }, {
                where: {
                    ID: body.CampaignID,
                }
            })
            var bodyHtml;
            for (var j = 0; j < information.length; j++) {
                if (information[j].Result == 'None' || information[j].Result == '' || information[j].Result == null) {
                    if (body.typeSend == 'Send') {
                        await mAdditionalInformation(db).update({
                            DateSend: now,
                            Result: 'None'
                        }, { where: { ID: information[j].ID } })
                    } else {
                        await mAdditionalInformation(db).update({
                            DateReminder: now,
                        }, { where: { ID: information[j].ID } })
                    }
                    bodyHtml = await handlePushDataToBody(template.body, information[j].ID, db);
                    // let Subject = information[j].Subject ? information[j].Subject : '';
                    let Subject = template.Subject ? template.Subject : '';
                    var arrayEmail = convertStringToListObject(information[j].Email);
                    var informationID = information[j].ID;
                    for (var i = 0; i < arrayEmail.length; i++) {
                        let tokenHttpTrack = `ip=${body.ip}&dbName=${body.dbName}&campainID=${body.CampaignID}&type=Mailmerge&idGetInfo=${body.userID}&email=${arrayEmail[i].name}&TickSendMail=${Math.floor(Math.random() * 1000000)}`;
                        let tokenHttpTrackEncrypt = mModules.encryptKey(tokenHttpTrack);
                        let httpTrack = `<img src="http://dbdev.namanphu.vn:3002/crm/open_mail?token=${tokenHttpTrackEncrypt}" height="1" width="1""/>`
                        let tokenUnsubscribe = `email=${arrayEmail[i].name}&ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&campainID=${body.CampaignID}&idGetInfo=${body.userID}&type=Mailmerge`;
                        let tokenUnsubscribeEncrypt = mModules.encryptKey(tokenUnsubscribe);
                        let unSubscribe = `<p>&nbsp;</p><p style="text-align: center;"><span style="font-size: xx-small;"><a href="http://dbdev.namanphu.vn:2220/#/submit?token=${tokenUnsubscribeEncrypt}"><u><span style="color: #0088ff;">Click Here</span></u></a> to unsubscribe from this email</span></p>`
                        bodyHtml = httpTrack + bodyHtml;
                        bodyHtml = bodyHtml + unSubscribe;
                        let mailUn = await mMailResponse(db).findOne({
                            where: {
                                Email: arrayEmail[i].name,
                                Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                                TypeSend: 'Mailmerge',
                            }
                        })
                        let emailSend = await mUser(db).findOne({ where: { Username: 'root' } });

                        emailSend = await mConfigEmailSend(db).findOne({
                            order: [
                                ['ID', 'DESC']
                            ],
                            where: { EmailSend: emailSend.Email }
                        });
                        console.log(emailSend, 123456);
                        if (!mailUn)
                            mAmazon.sendEmail(emailSend, arrayEmail[i].name, Subject, bodyHtml, [], req).then(async response => {
                                if (response) {
                                    await mAdditionalInformation(db).update({
                                        Status: Constant.MAIL_RESPONSE_TYPE.SEND,
                                        Result: 'None',
                                    }, {
                                        where: { ID: informationID },
                                    })
                                }
                            })
                        var emailR = arrayEmail[i].name;
                        mCheckMail.checkEmail(emailR, db).then(async(checkMailRes) => {
                            if (checkMailRes == false) {
                                var responeExits = await mMailResponse(db).findOne({
                                    where: {
                                        MailCampainID: body.CampaignID,
                                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                        TypeSend: 'Mailmerge',
                                        IDGetInfo: body.userID,
                                        Email: emailR,
                                    }
                                })
                                if (responeExits) {
                                    await mMailResponse(db).update({
                                        TimeCreate: now,
                                    }, { where: { ID: responeExits.ID } })
                                } else {
                                    await mMailResponse(db).create({
                                        MailCampainID: body.CampaignID,
                                        TimeCreate: now,
                                        Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                        TypeSend: 'Mailmerge',
                                        IDGetInfo: body.userID,
                                        Email: emailR,
                                    });
                                }

                            }
                        })
                    }
                }
            }
            res.json(Result.ACTION_SUCCESS);
        })
    },
}