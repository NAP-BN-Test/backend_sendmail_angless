const Result = require('../constants/result');
const Constant = require('../constants/constant');

const Op = require('sequelize').Op;
var mCompany = require('../tables/company');

var moment = require('moment');
var mContact = require('../tables/contact');

var database = require('../db');

var mMailList = require('../tables/mail-list');
var mMailListDetail = require('../tables/mail-list-detail');
let mAdditionalInformation = require('../tables/additional-infomation');
let mTemplate = require('../tables/template');

var mMailCampain = require('../tables/mail-campain');
var mMailResponse = require('../tables/mail-response');


var mCompanyMailList = require('../tables/company-maillist');
var mMailListCampaign = require('../tables/maillist-campaign');
var mGroupCampaign = require('../tables/group-campaign');
var mCampaignGroups = require('../tables/campaign-groups');


var mAmazon = require('../controllers/amazon');
var mCheckMail = require('../controllers/check-mail');
var cUser = require('../controllers/user');
var mMailResponse = require('../tables/mail-response');
const Sequelize = require('sequelize');
var mUser = require('../tables/user');
var mFileAttach = require('../tables/file-attach')

var mModules = require('../constants/modules');

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

function handleClickLink(body, mailListDetailID) {
    var bodyHtml = "";

    var listLink = body.body.split('<a');

    if (listLink.length > 0) {
        let tokenClickLink = `ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&idMailCampain=${body.campainID}&idMailListDetail=${mailListDetailID}`;
        let tokenClickLinkEncrypt = mModules.encryptKey(tokenClickLink);

        bodyHtml = listLink[0];

        // for (let i = 0; i < listLink.length; i++) {
        //     if (i > 0) {
        //         var content = "<a" + listLink[i].slice(0, 6) + `clicklink.namanphu.tech?token=${tokenClickLinkEncrypt}&url=` + listLink[i].slice(6);
        //         bodyHtml = bodyHtml + content;
        //     }
        // }

        return bodyHtml;
    } else return body.body;
}
var mConfigEmailSend = require('../tables/config-mail-send')

async function getCompanyIDFromCampaignID(db, campainID) {
    var mMailListID = [];
    await mMailListCampaign(db).findAll({
        where: {
            MailCampainID: campainID
        }
    }).then(data => {
        data.forEach(item => {
            mMailListID.push(item.MailListID)
        })
    })
    var mCompanyIDs = [];
    await mCompanyMailList(db).findAll({
        where: {
            MailListID: { [Op.in]: mMailListID }
        }
    }).then(company => {
        company.forEach(item => {
            mCompanyIDs.push(item.CompanyID);
        })
    })
    return mCompanyIDs;
}
async function resetJob(db) {
    try {
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        var schedule = require('node-schedule');
        var campaign = await mMailCampain(db).findAll({
            where: {
                [Op.and]: [
                    { TimeSend: { [Op.ne]: null } },
                    { Active: true },
                    { ResBody: { [Op.ne]: null } }
                ]
            }
        })
        if (campaign.length > 0) {
            for (var i = 0; i < campaign.length; i++) {
                var body = JSON.parse(campaign[i].ResBody);
                var mMailListID = [];
                await mMailListCampaign(db).findAll({
                    where: {
                        MailCampainID: campaign[i].ID
                    }
                }).then(data => {
                    data.forEach(item => {
                        mMailListID.push(item.MailListID)
                    })
                })
                var timeSend = moment(campaign[i].TimeSend).subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                for (var j = 0; j < mMailListID.length; j++) {
                    let mailListID = mMailListID[j];
                    let listCompany = await mCompanyMailList(db).findAll({ where: { MailListID: mMailListID[j] } })
                    for (var e = 0; e < listCompany.length; e++) {
                        let company = await mCompany(db).findOne({ where: { ID: listCompany[e].CompanyID } })
                        var arrayEmail = convertStringToListObject(company.Email);
                        var contact = await mContact(db).findAll({ where: { CompanyID: company.ID } })
                        contact.forEach(element => {
                            var mail = convertStringToListObject(element.Email);
                            mail.forEach(maile => {
                                arrayEmail.push(maile)
                            })
                        })
                        for (var f = 0; f < arrayEmail.length; f++) {
                            let emailReceived = arrayEmail[f].name;
                            var job = schedule.scheduleJob(timeSend, async function () {
                                let tokenHttpTrack = `ip=${body.ip}&dbName=${body.dbName}&campainID=${mailListID}&type=Maillist&idGetInfo=${body.userID}&email=${emailReceived}&TickSendMail=${Math.floor(Math.random() * 1000000)}`;
                                let tokenHttpTrackEncrypt = mModules.encryptKey(tokenHttpTrack);
                                let httpTrack = `<img src="http://dbdev.namanphu.vn:3002/crm/open_mail?token=${tokenHttpTrackEncrypt}" height="1" width="1""/>`
                                let tokenUnsubscribe = `email=${emailReceived}&ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&campainID=${mailListID}&idGetInfo=${body.userID}&type=Maillist`;
                                let tokenUnsubscribeEncrypt = mModules.encryptKey(tokenUnsubscribe);
                                let unSubscribe = `<p>&nbsp;</p><p style="text-align: center;"><span style="font-size: xx-small;"><a href="http://dbdev.namanphu.vn:2220/#/submit?token=${tokenUnsubscribeEncrypt}"><u><span style="color: #0088ff;">Click Here</span></u></a> to unsubscribe from this email</span></p>`
                                let bodyHtml = body.body;
                                bodyHtml = httpTrack + bodyHtml;
                                bodyHtml = bodyHtml + unSubscribe;
                                bodyHtml = bodyHtml.replace(/#ten/g, company.Name);
                                mCheckMail.checkEmail(emailReceived, db).then(async (checkMailRes) => {
                                    if (checkMailRes == false) {
                                        var responeExits = await mMailResponse(db).findOne({
                                            where: {
                                                Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                                TypeSend: 'Maillist',
                                                MaillistID: mailListID,
                                                IDGetInfo: body.userID,
                                                Email: emailReceived,
                                            }
                                        })
                                        if (responeExits) {
                                            await mMailResponse(db).update({
                                                TimeCreate: now,
                                            }, { where: { ID: responeExits.ID } })
                                        } else {
                                            await mMailResponse(db).create({
                                                TimeCreate: now,
                                                Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                                TypeSend: 'Maillist',
                                                MaillistID: mailListID,
                                                IDGetInfo: body.userID,
                                                Email: emailReceived,
                                            })
                                        }
                                    }
                                })
                                let mainUn = await mMailResponse(db).findOne({
                                    where: {
                                        Email: emailReceived,
                                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                                        TypeSend: 'Maillist'
                                    }
                                })
                                var arrayFile = body.attachFile ? JSON.parse(body.attachFile) : []
                                let emailSend = await mUser(db).findOne({ where: { Username: 'root' } });

                                emailSend = await mConfigEmailSend(db).findOne({
                                    order: [
                                        ['ID', 'DESC']
                                    ],
                                    where: { EmailSend: emailSend.Email }
                                });
                                if (!mainUn)
                                    await mAmazon.sendEmail(emailSend, emailReceived, body.subject, bodyHtml, arrayFile).then(async (sendMailRes) => {
                                        if (sendMailRes) {
                                            console.log(sendMailRes);
                                        }
                                        // await mMailResponse(db).create({
                                        //     MailCampainID: body.campainID,
                                        //     CompanyID: company.ID,
                                        //     TimeCreate: now,
                                        //     Type: Constant.MAIL_RESPONSE_TYPE.SEND
                                        // });
                                    });

                            });
                            console.log(job);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
async function deleteCampaign(db, listID) {
    try {
        await mFileAttach(db).destroy({
            where: {
                CampaignID: {
                    [Op.in]: listID,
                }
            }
        })
        await mAdditionalInformation(db).destroy({
            where: {
                CampaignID: {
                    [Op.in]: listID,
                }
            }
        })
        await mMailResponse(db).destroy({
            where: {
                MailCampainID: {
                    [Op.in]: listID
                }
            }
        })
        await mMailListCampaign(db).destroy({
            where: {
                MailCampainID: {
                    [Op.in]: listID
                }
            }
        })
        await mMailCampain(db).destroy({
            where: {
                ID: {
                    [Op.in]: listID
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.json(Result.SYS_ERROR_RESULT)
    }

}

async function addGroupToCampaign(listID, idCampaign, db) {
    await mMailListCampaign(db).destroy({
        where: {
            MailCampainID: idCampaign
        }
    })
    for (var i = 0; i < listID.length; i++) {
        await mMailListCampaign(db).create({
            MailListID: listID[i],
            MailCampainID: idCampaign,
        })
    }
}
const axios = require('axios');
const { LOGIN_FAIL } = require('../constants/result');

async function deleteImage(linkImage) {
    console.log(linkImage);
    var file = linkImage.replace("http://dbdev.namanphu.vn:1357/ageless_sendmail/", "")
    require("fs").unlink("C:/images_services/ageless_sendmail/" + file, (err) => {
        if (err) {
            console.log(err);
        }
    });
}
async function getListLinkImage(db, idCampaign) {
    try {
        var mailCampaign = await mMailCampain(db).findOne({
            where: { ID: idCampaign }
        })
        var keyField = []
        if (mailCampaign) {
            let body = mailCampaign.Body;
            const re = RegExp('<img src="(.*?)">', 'g');
            while ((matches = re.exec(body)) !== null) {
                keyField.push(matches[1]);
            }
        }
    } catch (error) {
        console.log(error);
    }
    return keyField;
}
function checkDuplicate(array, elm) {
    var check = false;
    array.forEach(item => {
        if (item === elm) check = true;
    })
    return check;
}
async function deleteImageResidual(listLink, listLinkNew) {
    for (var i = 0; i < listLink.length; i++) {
        if (!checkDuplicate(listLinkNew, listLink[i])) {
            await deleteImage(listLink[i]);
        }
    }
}
var mMailList = require('../tables/mail-list');
var mHistorySendMailCampaign = require('../tables/HistorySendMailCampaign');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

module.exports = {
    deleteImageResidual,
    resetJob,
    getCompanyIDFromCampaignID,
    deleteCampaign,
    copyMailCampaign: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mMailCampain(db).findOne({ where: { ID: body.id } }).then(async data => {
                try {
                    let now = moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                    data = {
                        Name: data.Name + '(Bản sao)',
                        TimeCreate: now,
                        TimeEnd: now,
                        OwnerID: Number(data.OwnerID),
                        Type: data.Type ? data.Type : '',
                        Body: data.Body ? data.Body : '',
                        Subject: data.Subject ? data.Subject : ''
                    }
                    var MailCampainID = await mMailCampain(db).create(data);
                    await mMailListCampaign(db).findAll({
                        where: {
                            MailCampainID: body.id,
                        }
                    }).then(async data => {
                        for (var i = 0; i < data.length; i++) {
                            await mMailListCampaign(db).create({
                                MailCampainID: Number(MailCampainID.ID),
                                MailListID: Number(data[i].MailListID),
                            })
                        }
                    })
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                    }
                    res.json(result);
                } catch (error) {
                    console.log(error);
                    res.json(Result.SYS_ERROR_RESULT)
                }
            })
        })
    },
    getListNameMailcampaignFromGroup: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                array = [];
                await mGroupCampaign(db).findAll().then(async group => {
                    for (var i = 0; i < group.length; i++) {
                        var obj = {
                            'idGroup': group[i].ID,
                            'nameGroup': group[i].Name,
                        };
                        await mCampaignGroups(db).findAll({
                            where: { IDGroup: group[i].ID }
                        }).then(async group1 => {
                            let detailList = [];
                            if (group1.length > 0) {
                                for (var j = 0; j < group1.length; j++) {
                                    let detailobj = {
                                        'id': group1[j].ID,
                                        'name': group1[j].Name,
                                    }
                                    detailList.push(detailobj)
                                    await mMailCampain(db).findAll({
                                        where: { IDgroup1: group1[j].ID }
                                    }).then(campaign => {
                                        if (campaign.length > 0) {
                                            let campaignList = [];
                                            for (let e = 0; e < campaign.length; e++) {
                                                let campaignObj = {
                                                    'id': campaign[e].ID,
                                                    'name': campaign[e].Name,
                                                }
                                                campaignList.push(campaignObj)
                                            }
                                            detailobj['listCampaign'] = campaignList;
                                        }
                                    })
                                }
                                obj['detailList'] = detailList;
                            }
                        })
                        if (obj['detailList'])
                            array.push(obj);
                    }
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
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
    getMailList: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var data = JSON.parse(body.dataSearch)

                if (data.search) {
                    where = [
                        { Name: { [Op.like]: '%' + data.search + '%' } },
                    ];
                } else {
                    where = [
                        { Name: { [Op.ne]: '%%' } },
                    ];
                }
                let whereOjb = { [Op.or]: where };
                if (data.items) {
                    for (var i = 0; i < data.items.length; i++) {
                        let userFind = {};
                        if (data.items[i].fields['name'] === 'Tên danh sách') {
                            userFind['Name'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
                            if (data.items[i].conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (data.items[i].fields['name'] === 'Người tạo') {
                            var owner = await mUser(db).findAll({
                                where: {
                                    Name: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
                                }
                            })
                            var listOwner = [];
                            owner.forEach(item => {
                                listOwner.push(item.ID)
                            })
                            userFind['OwnerID'] = { [Op.in]: listOwner }
                            if (data.items[i].conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                    }
                }
                var mailList = mMailList(db);
                mailList.belongsTo(mUser(db), { foreignKey: 'OwnerID' })
                mailList.hasMany(mMailListDetail(db), { foreignKey: 'MailListID' })
                var page = 1;
                var itemPerPage = 100000;
                if (body.page) {
                    page = body.page;
                    if (body.itemPerPage) {
                        itemPerPage = body.itemPerPage;
                    }
                }
                var mMailListData = await mailList.findAll({
                    where: whereOjb,
                    include: [
                        { model: mUser(db) },
                        { model: mMailListDetail(db) }
                    ],
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(itemPerPage) * (Number(page) - 1),
                    limit: Number(itemPerPage)
                })

                var array = [];
                mMailListData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        name: item.Name,
                        owner: item.User.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        contactCount: item.MailListDetails.length
                    })
                })

                var mMailListCount = await mailList.count({ where: whereOjb, });
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mMailListCount
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

    getMailListDetail: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var data = JSON.parse(body.data)
                var listCompanyID = [];
                await mCompanyMailList(db).findAll({
                    where: { MailListID: body.mailListID }
                }).then(data => {
                    data.forEach(item => {
                        listCompanyID.push(item.CompanyID);
                    })
                })
                if (data.search) {
                    where = [
                        { Name: { [Op.like]: '%' + data.search + '%' } },
                        { ID: { [Op.in]: listCompanyID } }
                    ];
                } else {
                    where = [
                        { Name: { [Op.like]: '%%' } },
                        { ID: { [Op.in]: listCompanyID } }
                    ];
                }
                let whereOjb = { [Op.and]: where };
                if (data.items) {
                    for (var i = 0; i < data.items.length; i++) {
                        let userFind = {};
                        if (data.items[i].fields['name'] === 'Name') {
                            userFind['Name'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
                            if (data.items[i].conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (data.items[i].fields['name'] === 'Email') {
                            userFind['Email'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
                            if (data.items[i].conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (data.items[i].conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                    }
                }
                var company = mCompany(db);
                company.belongsTo(mUser(db), { foreignKey: 'UserID' });
                company.hasMany(mMailResponse(db), { foreignKey: 'MailListDetailID' });
                var mCompanyData = await company.findAll({
                    where: whereOjb,
                    include: [
                        { model: mUser(db) },
                        {
                            model: mMailResponse(db),
                            required: false,
                            where: { Type: Constant.MAIL_RESPONSE_TYPE.SEND }
                        }
                    ],
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                })

                var mCompanyCount = await company.count({
                    where: whereOjb
                })
                var array = [];
                for (var i = 0; i < mCompanyData.length; i++) {
                    let listNameCompany = '';
                    let count = 0;
                    var companyDuplicant = await mCompanyMailList(db).findAll({
                        where: {
                            CompanyID: mCompanyData[i].ID,
                            [Op.not]: {
                                MailListID: body.mailListID
                            }
                        },
                    })
                    if (companyDuplicant.length > 0)
                        for (var j = 0; j < companyDuplicant.length; j++) {
                            await mMailList(db).findOne({ where: { ID: companyDuplicant[j].MailListID } }).then(data => {
                                if (data.Name) {
                                    count += 1;
                                    count > 1 ? listNameCompany += ', [' + data.Name + ']' : listNameCompany += '[' + data.Name + ']';
                                }
                            })
                        }
                    let mailCount = await mMailResponse(db).count({
                        where: {
                            MaillistID: body.mailListID,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                            TypeSend: 'Maillist',
                        }
                    })
                    array.push({
                        id: Number(mCompanyData[i].ID),
                        email: mCompanyData[i].Email,
                        owner: mCompanyData[i].User ? mCompanyData[i].User.Name : '',
                        createTime: mModules.toDatetime(mCompanyData[i].TimeCreate),
                        mailCount: mailCount,
                        contactName: mCompanyData[i].Name,
                        checkDuplicate: companyDuplicant.length > 0 ? true : false,
                        nameGroup: listNameCompany ? listNameCompany : '',
                    })

                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array,
                    count: mCompanyCount
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

    getListMailCampain: async function (req, res) {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);
                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' });
                mailCampain.belongsTo(mTemplate(db), { foreignKey: 'TemplateID', sourceKey: 'TemplateID', as: 'Template' });
                mailCampain.belongsTo(mTemplate(db), { foreignKey: 'IDTemplateReminder', sourceKey: 'IDTemplateReminder', as: 'TemplateRemider' });
                if (body.Type == 'MailMerge') {
                    if (body.idGroup1) {
                        var array = [
                            // where,
                            { IDGroup1: body.idGroup1 },
                            { Type: 'MailMerge' }
                        ]
                    }
                    else {
                        var array = [
                            // where,
                            { Type: 'MailMerge' }
                        ]
                    }
                    var mailCampainData = await mailCampain.findAll({
                        where: array,
                        include: [
                            { model: mUser(db) },
                            { model: mTemplate(db), required: false, as: 'Template' },
                            { model: mTemplate(db), required: false, as: 'TemplateRemider' }
                        ],
                        order: [
                            ['TimeCreate', 'DESC']
                        ],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });
                    var mailCampainCount = await mailCampain.count({
                        where: [
                            { IDGroup1: body.idGroup1 },
                            { Type: 'MailMerge' }
                        ],
                    });
                } else {
                    let whereObj = {}
                    let arraySearchAnd = [];
                    let arraySearchOr = [];
                    let arraySearchNot = [];
                    var data = JSON.parse(body.data);
                    if (data.search) {
                        let ownerIDs = []
                        await mUser(db).findAll({
                            where: {
                                Name: { [Op.like]: '%' + data.search + '%' },
                            }
                        }).then(data => {
                            data.forEach(item => {
                                ownerIDs.push(item.ID)
                            })
                        })
                        where = {
                            [Op.or]: [
                                { Name: { [Op.like]: '%' + data.search + '%' } },
                                { Subject: { [Op.like]: '%' + data.search + '%' } },
                                { OwnerID: { [Op.in]: ownerIDs } },
                                { Type: 'MailList' }

                            ],
                        };
                    } else {
                        where = [{
                            ID: {
                                [Op.ne]: null
                            },
                            Type: 'MailList'
                        },];
                    }
                    whereObj[Op.and] = where
                    console.log(data.items);
                    if (data.items) {
                        for (var i = 0; i < data.items.length; i++) {
                            let userFind = {};
                            if (data.items[i].fields['name'] === 'Tên chiến dịch') {
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
                            if (data.items[i].fields['name'] === 'Tiêu đề') {
                                userFind['Subject'] = {
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
                            if (data.items[i].fields['name'] === 'Người tạo') {
                                let ownerIDs = []
                                await mUser(db).findAll({
                                    where: {
                                        Name: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' },
                                    }
                                }).then(data => {
                                    data.forEach(item => {
                                        ownerIDs.push(item.ID)
                                    })
                                })
                                userFind['OwnerID'] = {
                                    [Op.in]: ownerIDs
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
                        arraySearchAnd.push({ Type: 'MailList' })
                        if (arraySearchOr.length > 0)
                            whereObj[Op.or] = arraySearchOr
                        if (arraySearchAnd.length > 0)
                            whereObj[Op.and] = arraySearchAnd
                        if (arraySearchNot.length > 0)
                            whereObj[Op.not] = arraySearchNot
                    }
                    console.log(whereObj, arraySearchAnd);
                    var mailCampainData = await mailCampain.findAll({
                        where: whereObj,
                        include: [
                            { model: mUser(db) },
                            { model: mTemplate(db), required: false, as: 'Template' },
                            { model: mTemplate(db), required: false, as: 'TemplateRemider' }
                        ],
                        order: [
                            ['TimeCreate', 'DESC']
                        ],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });
                    var mailCampainCount = await mailCampain.count({
                        where: [
                            { Type: 'MailList' }
                        ],
                    });
                }

                var array = [];
                if (mailCampainData) {
                    for (var i = 0; i < mailCampainData.length; i++) {

                        var numberAddressBook = await mAdditionalInformation(db).count({
                            where: { CampaignID: mailCampainData[i].ID }
                        });
                        var nearestSend = await mMailResponse(db).findOne(
                            {
                                order: [
                                    Sequelize.literal('max(TimeCreate) DESC'),
                                ],
                                group: ['MailListDetailID', 'MailCampainID', 'ID', 'Type', 'Reason', 'CompanyID', 'TypeSend', 'MaillistID', 'TimeCreate', 'IDGetInfo', 'Email', 'TickSendMail'],
                            }, {
                            where: {
                                MailCampainID: mailCampainData[i].ID,
                                Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                                TypeSend: 'Mailmerge',
                            }
                        });
                        var listMailList = '';
                        await mMailListCampaign(db).findAll({
                            where: { MailCampainID: mailCampainData[i].ID }
                        }).then(async data => {
                            for (var i = 0; i < data.length; i++) {
                                var mailList = await mMailList(db).findOne({
                                    where: { ID: data[i].MailListID }
                                })
                                if (i == data.length)
                                    listMailList = listMailList + mailList.Name
                                else
                                    listMailList = listMailList + mailList.Name + ', '

                            }
                        })
                        array.push({
                            id: Number(mailCampainData[i].ID),
                            name: mailCampainData[i].Name,
                            subject: mailCampainData[i].Subject,
                            owner: mailCampainData[i].User ? mailCampainData[i].User.Name : '',
                            createTime: moment(mailCampainData[i].TimeCreate).format('DD/MM/YYYY HH:mm'),
                            nearestSend: mailCampainData[i].TimeSend ? moment(mailCampainData[i].TimeSend).subtract(7, 'hour').format('DD/MM/YYYY HH:mm') : null,
                            TemplateName: mailCampainData[i].Template ? mailCampainData[i].Template.Name : '',
                            TemplateReminderName: mailCampainData[i].TemplateRemider ? mailCampainData[i].TemplateRemider.Name : '',
                            NumberAddressBook: numberAddressBook,
                            Description: mailCampainData[i].Description,
                            nameMailList: listMailList,
                        })
                    }
                }
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

    getMailCampainDetail: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var listMailList = [];
                await mMailListCampaign(db).findAll({
                    where: { MailCampainID: body.campainID }
                }).then(async data => {
                    for (var i = 0; i < data.length; i++) {
                        var mailList = await mMailList(db).findOne({
                            where: { ID: data[i].MailListID }
                        })
                        listMailList.push({
                            id: Number(data[i].MailListID),
                            name: mailList.Name ? mailList.Name : ''
                        })
                    }
                })
                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' })

                var mailCampainData = await mailCampain.findOne({
                    where: { ID: body.campainID },
                    include: [
                        { model: mUser(db) },
                    ]
                });
                var obj = {
                    id: Number(mailCampainData.ID),
                    name: mailCampainData.Name,
                    subject: mailCampainData.Subject,
                    owner: mailCampainData.User.Name,
                    body: mailCampainData.Body,
                    Description: mailCampainData.Description,
                    Type: mailCampainData.Type,
                    listMailList,
                    listLink: mailCampainData.listLink ? mailCampainData.listLink : '',
                    timeSend: mailCampainData.TimeSend ? JSON.stringify(moment(mailCampainData.TimeSend).subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS')) : null
                }
                var arrayFile = []
                await mFileAttach(db).findAll({ where: { CampaignID: mailCampainData.ID } }).then(file => {
                    if (file.length > 0) {
                        for (var e = 0; e < file.length; e++) {
                            arrayFile.push({
                                name: file[e].Name ? file[e].Name : '',
                                link: file[e].Link ? file[e].Link : '',
                                id: file[e].ID,
                            })
                        }
                    }
                })
                obj['arrayFile'] = arrayFile;
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj
                }
                res.json(result);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }
        }, error => {
            res.json(error)
        })

    },

    addMailList: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');

                var mailList = await mMailList(db).create({
                    Name: body.name,
                    OwnerID: Number(body.userID),
                    TimeCreate: now,
                })

                if (body.listMail) {
                    let arrMail = JSON.parse(body.listMail);

                    let bulkCreate = [];
                    arrMail.forEach(mailItem => {
                        bulkCreate.push({
                            Email: mailItem,
                            OwnerID: body.userID,
                            TimeCreate: now,
                            MailListID: mailList.ID,
                        })
                    })

                    await mMailListDetail(db).bulkCreate(bulkCreate);
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    deleteMailList: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    var listMaiDetail = await mMailListDetail(db).findAll({
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    })
                    var listIDDetail = [];
                    listMaiDetail.forEach(item => {
                        listIDDetail.push(item.ID);
                    })
                    if (listIDDetail.length > 0) {
                        await mMailResponse(db).destroy({
                            where: {
                                MailListDetailID: {
                                    [Op.in]: listIDDetail,
                                }
                            }
                        })
                    }
                    await mMailListDetail(db).destroy({
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mCompany(db).update({ MailListID: null }, {
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mMailCampain(db).update({ MailListID: null }, {
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    });
                    await mMailListCampaign(db).destroy({
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    })
                    await mCompanyMailList(db).destroy({
                        where: {
                            MailListID: {
                                [Op.in]: listID
                            }
                        }
                    })
                    await mMailList(db).destroy({
                        where: {
                            ID: {
                                [Op.in]: listID
                            }
                        }
                    });
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addCompanyTodMailList: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let array = []
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    for (var i = 0; i < listID.length; i++) {
                        let check = await mCompanyMailList(db).findAll({
                            where: {
                                CompanyID: listID[i],
                                MailListID: body.mailListID,
                            }
                        })
                        if (check.length <= 0) {
                            await mCompanyMailList(db).create({
                                CompanyID: listID[i],
                                MailListID: body.mailListID,
                            })
                        }
                    }
                }
                let result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    // array: array
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

    deleteMailCampain: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    await deleteCampaign(db, listID);
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    deleteMailListDetail: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    await mCompanyMailList(db).destroy({
                        where: {
                            [Op.and]: [
                                { MailListID: body.mailListID },
                                { CompanyID: { [Op.in]: listID } }
                            ]
                        }
                    })
                }

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailCampain: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                data = {
                    Name: body.name,
                    TimeCreate: now,
                    TimeEnd: now,
                    OwnerID: Number(body.userID),
                    Type: body.Type
                }
                var mailCampainData;
                if (body.Type === "MailList") {
                    data['Subject'] = body.subject ? body.subject : null;
                    mailCampainData = await mMailCampain(db).create(data);
                } else {
                    data['TemplateID'] = body.TemplateID ? body.TemplateID : null;
                    data['IDTemplateReminder'] = body.idTemplateReminder ? body.idTemplateReminder : null;
                    data['IDGroup1'] = body.idGroup1 ? body.idGroup1 : null;
                    mailCampainData = await mMailCampain(db).create(data);
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    id: mailCampainData.ID
                }

                res.json(result);

            } catch (error) {
                console.log(error + "");
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },
    addMailResponse: async function (req, res) {
        let query = req._parsedUrl.query;
        let queryDecrypt = mModules.decryptKey(query.replace("token=", ""));
        let params = queryDecrypt.split('&');
        let ip = params[0].split('=')[1];
        let dbName = params[1].split('=')[1];
        let idCampaign = params[2].split('=')[1];
        let type = params[3].split('=')[1];
        let idGetInfo = params[4].split('=')[1];
        let email = params[5].split('=')[1];
        let tickSendMail = params[6].split('=')[1];
        database.checkServerInvalid(ip, dbName, '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
            if (type === 'Maillist') {
                var responeExits = await mMailResponse(db).findOne({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        MaillistID: idCampaign,
                        IDGetInfo: idGetInfo,
                        Email: email,
                        TickSendMail: tickSendMail.toString(),
                    }
                })
                if (responeExits) {
                    await mMailResponse(db).update({
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    }, { where: { ID: responeExits.ID } })
                } else {
                    await mMailResponse(db).create({
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        TypeSend: type ? type : '',
                        MaillistID: idCampaign,
                        IDGetInfo: idGetInfo,
                        Email: email,
                        TickSendMail: tickSendMail.toString(),
                    })
                }
            } else {
                var responeExits = await mMailResponse(db).findOne({
                    where: {
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        MailCampainID: idCampaign,
                        IDGetInfo: idGetInfo,
                        Email: email,
                        TickSendMail: tickSendMail.toString(),
                    }
                })
                if (responeExits) {
                    await mMailResponse(db).update({
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    }, { where: { ID: responeExits.ID } })
                } else {
                    await mMailResponse(db).create({
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                        Type: Constant.MAIL_RESPONSE_TYPE.OPEN,
                        TypeSend: type ? type : '',
                        MailCampainID: idCampaign,
                        IDGetInfo: idGetInfo,
                        Email: email,
                        TickSendMail: tickSendMail.toString(),
                    })
                }
            }
        }, error => {
            res.json(error)
        })
    },

    addMailClickLink: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                await mMailResponse(db).create({
                    MailListDetailID: body.mailListDetailID,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    MailCampainID: body.campainID,
                    Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK,
                    TypeSend: body.type,
                })

                res.json(Result.ACTION_SUCCESS)
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    addMailSend: async function (req, res) {
        let body = req.body;
        body.body = body.body.replace(/%20/g, ' ');
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let timeSend = moment(body.timeSend).format('YYYY-MM-DD HH:mm:ss.SSS');
                if (body.isTestMail) {
                    mAmazon.sendEmail(body.myMail, body.myMail, body.subject, body.body);
                    res.json(Result.ACTION_SUCCESS);
                } else {
                    // update time send mail--------------------------------------------------------------------------------------------------------------------------
                    var text = '';
                    if (body.body || body.body === '') {
                        var listLink = await getListLinkImage(db, body.campainID);
                        text = body.body;
                        text = text.replace(/%20/g, ' ');
                        const re = RegExp('<img src="(.*?)">', 'g');
                        const keyField = []
                        const DIR = 'C:/images_services/ageless_sendmail/';
                        var datetime = new Date();
                        var listLinkNew = [];
                        var matchesList = [];
                        var linkImageList = [];
                        var dirList = [];
                        while ((matches = re.exec(text)) !== null) {
                            var numberRandom = Math.floor(Math.random() * 1000000);
                            nameMiddle = Date.parse(datetime) + numberRandom.toString();
                            var dir = DIR + 'photo-' + nameMiddle + '.jpg';
                            var linkImage = 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-' + nameMiddle + '.jpg'
                            if (matches[1].indexOf('http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-') == -1) {
                                dirList.push(dir);
                                matchesList.push(matches[1]);
                                linkImageList.push(linkImage);
                                keyField.push(matches[1].replace(/ /g, '+'));
                                listLinkNew.push(linkImage);
                            }
                            else {
                                listLinkNew.push(matches[1]);
                            }
                        }
                        if (matchesList.length > 0) {
                            for (var j = 0; j < matchesList.length; j++) {
                                text = text.replace(matchesList[j], linkImageList[j]);
                                var base64Data = matchesList[j].replace('data:image/jpeg;base64,', "");
                                base64Data = base64Data.replace(/ /g, '+');
                                var buf = new Buffer.from(base64Data, "base64");
                                require("fs").writeFile(dirList[j], buf, function (err) {
                                    if (err) console.log(err + '');
                                });
                            }
                        }
                        await deleteImageResidual(listLink, listLinkNew);
                    }
                    await mMailCampain(db).update({
                        TimeSend: timeSend,
                        Body: text,
                        Name: body.name ? body.name : '',
                        Subject: body.subject ? body.subject : '',
                        Active: true,
                        ResBody: JSON.stringify(body),
                        listLink: body.attachFile,
                    }, {
                        where: { ID: body.campainID }
                    })
                    let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                    if (body.mailListID || body.mailListID === '') {
                        let listID = JSON.parse(body.mailListID)
                        await mMailListCampaign(db).destroy({
                            where: {
                                MailCampainID: body.campainID
                            }
                        })
                        for (var i = 0; i < listID.length; i++) {
                            await mMailListCampaign(db).create({
                                MailListID: listID[i],
                                MailCampainID: body.campainID,
                            })
                            await mHistorySendMailCampaign(db).create({
                                MailListID: listID[i],
                                MailCampainID: body.campainID,
                                DateTime: now,
                            })
                        }
                        await addGroupToCampaign(listID, body.campainID, db);
                    }
                    var mMailListID = [];
                    await mMailListCampaign(db).findAll({
                        where: {
                            MailCampainID: body.campainID
                        }
                    }).then(data => {
                        data.forEach(item => {
                            mMailListID.push(item.MailListID)
                        })
                    })
                    console.log(mMailListID);
                    for (var j = 0; j < mMailListID.length; j++) {
                        await mMailResponse(db).create({
                            MaillistID: mMailListID[j],
                            TimeCreate: now,
                            Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                            TypeSend: 'Maillist',
                            IDGetInfo: body.userID,
                            MailCampainID: body.campainID,
                        })
                    }
                    resetJob(db);
                    res.json(Result.ACTION_SUCCESS)
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },
    sendMailNow: async function (req, res) {
        let body = req.body;
        body.body = body.body.replace(/%20/g, ' ');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                var mMailListID = [];
                await mMailListCampaign(db).findAll({
                    where: {
                        MailCampainID: body.campainID
                    }
                }).then(data => {
                    data.forEach(item => {
                        mMailListID.push(item.MailListID)
                    })
                })
                for (var j = 0; j < mMailListID.length; j++) {
                    await mMailResponse(db).create({
                        MaillistID: mMailListID[j],
                        TimeCreate: now,
                        Type: Constant.MAIL_RESPONSE_TYPE.SEND,
                        TypeSend: 'Maillist',
                        IDGetInfo: body.userID,
                        MailCampainID: body.campainID,
                    })
                }
                for (var j = 0; j < mMailListID.length; j++) {
                    let mailListID = mMailListID[j];
                    let listCompany = await mCompanyMailList(db).findAll({ where: { MailListID: mMailListID[j] } })
                    for (var e = 0; e < listCompany.length; e++) {
                        let company = await mCompany(db).findOne({ where: { ID: listCompany[e].CompanyID } })
                        var arrayEmail = convertStringToListObject(company.Email);
                        var contact = await mContact(db).findAll({ where: { CompanyID: company.ID } })
                        contact.forEach(element => {
                            var mail = convertStringToListObject(element.Email);
                            mail.forEach(maile => {
                                arrayEmail.push(maile)
                            })
                        })
                        for (var f = 0; f < arrayEmail.length; f++) {
                            let emailReceived = arrayEmail[f].name;
                            let tokenHttpTrack = `ip=${body.ip}&dbName=${body.dbName}&campainID=${mailListID}&type=Maillist&idGetInfo=${body.userID}&email=${emailReceived}&TickSendMail=${Math.floor(Math.random() * 1000000)}`;
                            let tokenHttpTrackEncrypt = mModules.encryptKey(tokenHttpTrack);
                            let httpTrack = `<img src="http://dbdev.namanphu.vn:3002/crm/open_mail?token=${tokenHttpTrackEncrypt}" height="1" width="1""/>`
                            let tokenUnsubscribe = `email=${emailReceived}&ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&campainID=${mailListID}&idGetInfo=${body.userID}&type=Maillist`;
                            let tokenUnsubscribeEncrypt = mModules.encryptKey(tokenUnsubscribe);
                            let unSubscribe = `<p>&nbsp;</p><p style="text-align: center;"><span style="font-size: xx-small;"><a href="http://dbdev.namanphu.vn:2220/#/submit?token=${tokenUnsubscribeEncrypt}"><u><span style="color: #0088ff;">Click Here</span></u></a> to unsubscribe from this email</span></p>`
                            let bodyHtml = body.body;
                            bodyHtml = httpTrack + bodyHtml;
                            bodyHtml = bodyHtml + unSubscribe;
                            bodyHtml = bodyHtml.replace(/#ten/g, company.Name);
                            // let emailSend = await mUser(db).findOne({ where: { Username: 'root' } });
                            mCheckMail.checkEmail(emailReceived, db).then(async (checkMailRes) => {
                                if (checkMailRes == false) {
                                    var responeExits = await mMailResponse(db).findOne({
                                        where: {
                                            Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                            TypeSend: 'Maillist',
                                            MaillistID: mailListID,
                                            IDGetInfo: body.userID,
                                            Email: emailReceived,
                                        }
                                    })
                                    if (responeExits) {
                                        await mMailResponse(db).update({
                                            TimeCreate: now,
                                        }, { where: { ID: responeExits.ID } })
                                    } else {
                                        await mMailResponse(db).create({
                                            TimeCreate: now,
                                            Type: Constant.MAIL_RESPONSE_TYPE.INVALID,
                                            TypeSend: 'Maillist',
                                            MaillistID: mailListID,
                                            IDGetInfo: body.userID,
                                            Email: emailReceived,
                                        })
                                    }
                                }
                            })
                            let mainUn = await mMailResponse(db).findOne({
                                where: {
                                    Email: emailReceived,
                                    Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                                    TypeSend: 'Maillist'
                                }
                            })
                            let emailSend = await mUser(db).findOne({ where: { Username: 'root' } });

                            emailSend = await mConfigEmailSend(db).findOne({
                                order: [
                                    ['ID', 'DESC']
                                ],
                                where: { EmailSend: emailSend.Email }
                            });
                            if (!mainUn)
                                await mAmazon.sendEmail(emailSend, emailReceived, body.subject, bodyHtml).then(async (sendMailRes) => {
                                    if (sendMailRes) {
                                        console.log(sendMailRes);
                                    }
                                    // await mMailResponse(db).create({
                                    //     MailCampainID: body.campainID,
                                    //     CompanyID: company.ID,
                                    //     TimeCreate: now,
                                    //     Type: Constant.MAIL_RESPONSE_TYPE.SEND
                                    // });
                                });

                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }

        }, error => {
            res.json(error)
        })
    },

    getMailListOption: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var mMailListData = await mMailList(db).findAll({});
                var array = [];
                mMailListData.forEach(item => {
                    array.push({
                        id: Number(item.ID),
                        name: item.Name,
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array
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


    updateMailCampain: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let update = [];
                if (body.name || body.name === '')
                    update.push({ key: 'Name', value: body.name });
                if (body.subject || body.subject === '')
                    update.push({ key: 'Subject', value: body.subject });
                if (body.startTime || body.startTime === '') {
                    let time = moment(body.startTime).format('YYYY-MM-DD HH:mm:ss.SSS')
                    update.push({ key: 'TimeCreate', value: time });
                }
                if (body.endTime || body.endTime === '') {
                    let time = moment(body.endTime).format('YYYY-MM-DD HH:mm:ss.SSS')
                    update.push({ key: 'TimeEnd', value: time });
                }
                // if (body.timeSend || body.timeSend === '') {
                //     let time = moment(body.timeSend).format('YYYY-MM-DD HH:mm:ss.SSS')
                //     update.push({ key: 'TimeSend', value: time });
                // }
                body.attachFile = JSON.parse(body.attachFile)
                if (body.attachFile.length > 0)
                    for (var j = 0; j < body.attachFile.length; j++)
                        await mFileAttach(db).update({
                            CampaignID: body.campainID,
                        }, {
                            where: {
                                ID: body.attachFile[j].id
                            }
                        })
                update.push({ key: 'Active', value: false });
                console.log(body);
                if (body.Type == 'MailList') {
                    if (body.body || body.body === '') {
                        var listLink = await getListLinkImage(db, body.campainID);
                        let text = body.body;
                        text = text.replace(/%20/g, ' ');
                        text = text.replace('data:image/png;base64,', "data:image/jpeg;base64,");
                        const re = RegExp('<img src="(.*?)">', 'g');
                        const keyField = []
                        const DIR = 'C:/images_services/ageless_sendmail/';
                        var datetime = new Date();
                        var listLinkNew = [];
                        var matchesList = [];
                        var linkImageList = [];
                        var dirList = [];
                        while ((matches = re.exec(text)) !== null) {
                            var numberRandom = Math.floor(Math.random() * 1000000);
                            nameMiddle = Date.parse(datetime) + numberRandom.toString();
                            var dir = DIR + 'photo-' + nameMiddle + '.jpg';
                            var linkImage = 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-' + nameMiddle + '.jpg'
                            if (matches[1].indexOf('http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-') == -1) {
                                dirList.push(dir);
                                matchesList.push(matches[1]);
                                linkImageList.push(linkImage);
                                keyField.push(matches[1].replace(/ /g, '+'));
                                listLinkNew.push(linkImage);
                            }
                            else {
                                listLinkNew.push(matches[1]);
                            }
                        }
                        if (matchesList.length > 0) {
                            for (var j = 0; j < matchesList.length; j++) {
                                if (matchesList[j].length > 10000) {
                                    var base64Data;
                                    text = text.replace(matchesList[j], linkImageList[j]);
                                    base64Data = matchesList[j].replace('data:image/jpeg;base64,', "");
                                    base64Data = base64Data.replace(/ /g, '+');
                                    var buf = new Buffer.from(base64Data, "base64");
                                    require("fs").writeFile(dirList[j], buf, function (err) {
                                        if (err) console.log(err + '');
                                    });
                                }
                            }
                        }
                        // có dòng text = text.replace(matches[1], linkImage); là k chạy qua/ not hiểu
                        update.push({ key: 'Body', value: text });
                        await deleteImageResidual(listLink, listLinkNew);
                    }
                } else {
                    if (body.body || body.body === '') {
                        update.push({ key: 'Body', value: body.body });
                    }
                    if (body.idGroup1 || body.idGroup1 === '') {
                        await mCampaignGroups(db).update({
                            IDGroup: body.idGroup1
                        }, {
                            where: { IDCampaign: body.campainID }
                        })
                    }
                    if (body.TemplateID || body.TemplateID === '')
                        update.push({ key: 'TemplateID', value: body.TemplateID });
                    if (body.idTemplateReminder || body.idTemplateReminder === '')
                        update.push({ key: 'IDTemplateReminder', value: body.idTemplateReminder });
                    if (body.Description || body.Description === '')
                        update.push({ key: 'Description', value: body.Description });
                    if (body.NumberAddressBook || body.NumberAddressBook === '')
                        update.push({ key: 'NumberAddressBook', value: Number(body.NumberAddressBook) });
                }
                database.updateTable(update, mMailCampain(db), body.campainID).then(mailCampainRes => {
                    if (mailCampainRes == 1) {
                        res.json(Result.ACTION_SUCCESS);
                    }
                })
            } catch (error) {
                console.log(error + "");
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })

    },

    reportEmailDetail: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {

                var mailListDetail = mMailListDetail(db);
                mailListDetail.belongsTo(mMailList(db), { foreignKey: 'MailListID' })
                mailListDetail.belongsTo(mUser(db), { foreignKey: 'OwnerID' })

                var mailResponse = mMailResponse(db);
                mailResponse.belongsTo(mMailCampain(db), { foreignKey: 'MailCampainID' })
                mailResponse.belongsTo(mailListDetail, { foreignKey: 'MailListDetailID' })


                var mailResponseData = await mailResponse.findAll({
                    include: [{
                        model: mMailCampain(db)
                    }, {
                        model: mailListDetail,
                        where: { Email: body.email },
                        include: [{
                            model: mMailList(db)
                        }, {
                            model: mUser(db)
                        }]
                    }]
                })

                var array = [];
                mailResponseData.forEach(item => {
                    array.push({
                        id: item.ID,
                        campainName: item.MailCampain.Name,
                        mailListName: item.MailListDetail.MailList.Name,
                        createTime: mModules.toDatetime(item.TimeCreate),
                        senderName: item.MailListDetail.User.Name,
                        status: 1
                    })
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    array
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
    checkDuplicateAddressbook: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let array = []
                let listID = JSON.parse(body.listID);
                console.log(listID);
                let stt = 0;
                for (var i = 0; i < listID.length; i++) {
                    let CompanyMailList = mCompanyMailList(db);
                    CompanyMailList.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID', as: 'company' })
                    await CompanyMailList.findAll({
                        where: {
                            CompanyID: listID[i],
                        },
                        include: [
                            {
                                model: mCompany(db),
                                required: false,
                                as: 'company'
                            },
                        ],
                    }).then(async data => {
                        if (data) {
                            for (let d = 0; d < data.length; d++) {
                                let group = await mMailList(db).findOne({
                                    where: {
                                        ID: data[d].MailListID
                                    }
                                })
                                array.push({
                                    stt: stt.toString(),
                                    addressbookID: listID[i],
                                    name: data[d].company ? data[d].company.Name : '',
                                    email: data[d].company ? data[d].company.Email : '',
                                    address: data[d].company ? data[d].company.Address : '',
                                    shortName: data[d].company ? data[d].company.ShortName : '',
                                    phone: data[d].company ? data[d].company.Phone : '',
                                    group: group ? group.Name : '',
                                    groupID: group ? group.ID : null,
                                })
                                stt += 1
                            }

                        }
                    })
                }
                if (array.length <= 0)
                    for (var i = 0; i < listID.length; i++) {
                        await mCompanyMailList(db).create({
                            CompanyID: listID[i],
                            MailListID: body.mailListID,
                        })
                    }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    array: array
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

    getHistorySendMailCampaign: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let array = []
                var itemPerPage = 10000;
                var page = 1;
                if (body.itemPerPage) {
                    itemPerPage = Number(body.itemPerPage);
                    if (body.page)
                        page = Number(body.page);
                }
                await mHistorySendMailCampaign(db).findAll({
                    where: {
                        MailCampainID: body.campaignID,
                    },
                    offset: itemPerPage * (page - 1),
                    limit: itemPerPage
                }).then(async data => {
                    for (let d = 0; d < data.length; d++) {
                        let mailList = await mMailList(db).findOne({
                            where: {
                                ID: data[d].MailListID
                            }
                        })
                        array.push({
                            groupName: mailList ? mailList.Name : '',
                            date: data[d].DateTime ? moment(data[d].DateTime).subtract(7, 'hours').format("DD/MM/YYYY HH:mm:ss") : null,
                        })
                    }
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    array: array
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