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



var mAmazon = require('../controllers/amazon');
var mCheckMail = require('../controllers/check-mail');
var cUser = require('../controllers/user');

var mUser = require('../tables/user');

var mModules = require('../constants/modules');

function handleClickLink(body, mailListDetailID) {
    var bodyHtml = "";

    var listLink = body.body.split('<a');

    if (listLink.length > 0) {
        let tokenClickLink = `ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&idMailCampain=${body.campainID}&idMailListDetail=${mailListDetailID}`;
        let tokenClickLinkEncrypt = mModules.encryptKey(tokenClickLink);

        bodyHtml = listLink[0];

        for (let i = 0; i < listLink.length; i++) {
            if (i > 0) {
                var content = "<a" + listLink[i].slice(0, 6) + `clicklink.namanphu.tech?token=${tokenClickLinkEncrypt}&url=` + listLink[i].slice(6);
                bodyHtml = bodyHtml + content;
            }
        }

        return bodyHtml;
    } else return body.body;
}

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
                    { ResBody: { [Op.ne]: null } }

                ]
            }
        })
        if (campaign.length > 0) {
            for (var i = 0; i < campaign.length; i++) {
                var body = JSON.parse(campaign[i].ResBody);
                var mCompanyIDs = await getCompanyIDFromCampaignID(db, body.campainID);
                var companyData = await mCompany(db).findAll({
                    where: { ID: { [Op.in]: mCompanyIDs } }
                })
                var timeSend = moment(campaign[i].TimeSend).subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                var job = schedule.scheduleJob(timeSend, function () {
                    console.log('aaaaaa');
                    companyData.forEach(async (mailItem) => {
                        let tokenHttpTrack = `ip=${body.ip}&dbName=${body.dbName}&idMailDetail=${mailItem.ID}&idMailCampain=${body.campainID}`;
                        let tokenHttpTrackEncrypt = mModules.encryptKey(tokenHttpTrack);
                        let httpTrack = `<img src="http://163.44.192.123:3302/crm/open_mail?token=${tokenHttpTrackEncrypt}" height="1" width="1""/>`

                        let tokenUnsubscribe = `email=${mailItem.Email}&ip=${body.ip}&dbName=${body.dbName}&secretKey=${body.secretKey}&campainID=${body.campainID}`;
                        let tokenUnsubscribeEncrypt = mModules.encryptKey(tokenUnsubscribe);
                        let unSubscribe = `<p>&nbsp;</p><p style="text-align: center;"><span style="font-size: xx-small;"><a href="http://unsubscribe.namanphu.tech/#/submit?token=${tokenUnsubscribeEncrypt}"><u><span style="color: #0088ff;">Click Here</span></u></a> to unsubscribe from this email</span></p>`

                        let bodyHtml = handleClickLink(body, mailItem.ID);

                        bodyHtml = httpTrack + bodyHtml;
                        bodyHtml = bodyHtml + unSubscribe;
                        bodyHtml = bodyHtml.replace(/#ten/g, mailItem.Name);
                        mCheckMail.checkEmail(mailItem.Email).then(async (checkMailRes) => {
                            if (checkMailRes == false) {
                                await mMailResponse(db).create({
                                    MailCampainID: body.campainID,
                                    CompanyID: mailItem.ID,
                                    TimeCreate: now,
                                    Type: Constant.MAIL_RESPONSE_TYPE.INVALID
                                });
                            }
                        })
                        mAmazon.sendEmail(body.myMail, mailItem.Email, body.subject, bodyHtml).then(async (sendMailRes) => {
                            if (sendMailRes)
                                await mMailResponse(db).create({
                                    MailCampainID: body.campainID,
                                    CompanyID: mailItem.ID,
                                    TimeCreate: now,
                                    Type: Constant.MAIL_RESPONSE_TYPE.SEND
                                });
                        });

                    });
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    resetJob,
    getCompanyIDFromCampaignID,
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

    getMailList: async function (req, res) {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var data = JSON.parse(body.data)

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
                        if (data.items[i].fields['name'] === 'Owner') {
                            var owner = await mUser(db).findAll({
                                where: {
                                    Name: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
                                }
                            })
                            var listOwner = [];
                            owner.forEach(item => {
                                listOwner.push(item.ID)
                            })
                            userFind['OwnerID'] = { [Op.like]: listOwner }
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
                    array.push({
                        id: Number(mCompanyData[i].ID),
                        email: mCompanyData[i].Email,
                        owner: mCompanyData[i].User ? mCompanyData[i].User.Name : '',
                        createTime: mModules.toDatetime(mCompanyData[i].TimeCreate),
                        mailCount: mCompanyData[i].MailResponses.length,
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
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mailCampain = mMailCampain(db);
                mailCampain.belongsTo(mUser(db), { foreignKey: 'OwnerID' });
                mailCampain.belongsTo(mTemplate(db), { foreignKey: 'TemplateID', sourceKey: 'TemplateID', as: 'Template' });
                if (body.Type == 'MailMerge') {
                    var mailCampainData = await mailCampain.findAll({
                        where: [
                            where,
                            { Type: 'MailMerge' }
                        ],
                        include: [
                            { model: mUser(db) },
                            { model: mTemplate(db), required: false, as: 'Template' }
                        ],
                        order: [
                            ['TimeCreate', 'DESC']
                        ],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });
                } else {
                    var data = JSON.parse(body.data);
                    if (data.search) {
                        where = [
                            { Name: { [Op.like]: '%' + data.search + '%' } },
                            { Type: 'MailList' }
                        ];
                    } else {
                        where = [
                            { Name: { [Op.like]: '%%' } },
                            { Type: 'MailList' }
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
                            if (data.items[i].fields['name'] === 'Subject') {
                                userFind['Subject'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                    var mailCampainData = await mailCampain.findAll({
                        where: whereOjb,
                        include: [
                            { model: mUser(db) },
                            { model: mTemplate(db), required: false, as: 'Template' }
                        ],
                        order: [
                            ['TimeCreate', 'DESC']
                        ],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });
                }

                var mailCampainCount = await mailCampain.count({
                    where: [
                        where,
                        { Type: 'MailMerge' }
                    ],
                });

                var array = [];
                for (var i = 0; i < mailCampainData.length; i++) {

                    var numberAddressBook = await mAdditionalInformation(db).count({
                        where: { CampaignID: mailCampainData[i].ID }
                    });
                    array.push({
                        id: Number(mailCampainData[i].ID),
                        name: mailCampainData[i].Name,
                        subject: mailCampainData[i].Subject,
                        owner: mailCampainData[i].User ? mailCampainData[i].User.Name : '',
                        createTime: mModules.toDatetime(mailCampainData[i].TimeCreate),
                        nearestSend: '2020-05-30 14:00',
                        TemplateName: mailCampainData[i].Template ? mailCampainData[i].Template.Name : '',
                        NumberAddressBook: numberAddressBook,
                        Description: mailCampainData[i].Description
                    })
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
                    listMailList
                }
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
                if (body.listID) {
                    let listID = JSON.parse(body.listID);
                    for (var i = 0; i < listID.length; i++) {
                        await mCompanyMailList(db).create({
                            CompanyID: listID[i],
                            MailListID: body.mailListID,
                        })
                    }
                }
                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
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
                    TimeEnd: moment(body.endTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
                    OwnerID: Number(body.userID),
                    Type: body.Type
                }
                var mailCampainData;
                if (body.Type === "MailList") {
                    data['Subject'] = body.subject ? body.subject : null;
                    mailCampainData = await mMailCampain(db).create(data);
                    let listID = JSON.parse(body.mailListID);
                    for (var i = 0; i < listID.length; i++) {
                        await mMailListCampaign(db).create({
                            MailCampainID: mailCampainData.ID,
                            MailListID: listID[i],
                        })
                    }
                } else {
                    data['TemplateID'] = body.TemplateID ? body.TemplateID : null;
                    mailCampainData = await mMailCampain(db).create(data)

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
        let idMailDetail = params[2].split('=')[1];
        let idMailCampain = params[3].split('=')[1];

        database.checkServerInvalid(ip, dbName, '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
            try {
                await mMailResponse(db).create({
                    MailListDetailID: idMailDetail,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    MailCampainID: idMailCampain,
                    Type: MAIL_RESPONSE_TYPE.OPEN
                })

                res.json(Result.ACTION_SUCCESS)
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
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
                    Type: Constant.MAIL_RESPONSE_TYPE.CLICK_LINK
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
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let timeSend = moment(body.timeSend).format('YYYY-MM-DD HH:mm:ss.SSS');
                if (body.isTestMail) {
                    mAmazon.sendEmail(body.myMail, body.myMail, body.subject, body.body);
                    res.json(Result.ACTION_SUCCESS);
                } else {
                    // update time send mail--------------------------------------------------------------------------------------------------------------------------
                    await mMailCampain(db).update({
                        TimeSend: timeSend,
                        ResBody: JSON.stringify(body),
                    }, {
                        where: { ID: body.campainID }
                    })
                    resetJob(db);
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },

    getMailListOption: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var userRole = await cUser.checkUser(body.ip, body.dbName, body.userID);
                var where = [];
                if (userRole) where = await mModules.handleWhereClause([{ key: 'OwnerID', value: Number(body.userID) }]);

                var mMailListData = await mMailList(db).findAll({ where: where });
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
                if (body.body || body.body === '') {
                    update.push({ key: 'Body', value: body.body });
                }
                if (body.Type == 'MailList') {
                    if (body.mailListID || body.mailListID === '') {
                        await mMailListCampaign(db).destroy({
                            where: {
                                MailCampainID: body.campainID
                            }
                        })
                        let listID = JSON.parse(body.mailListID);
                        for (var i = 0; i < listID.length; i++) {
                            await mMailListCampaign(db).create({
                                MailCampainID: body.campainID,
                                MailListID: listID[i],
                            })
                        }
                    }
                } else {
                    if (body.TemplateID || body.TemplateID === '')
                        update.push({ key: 'TemplateID', value: body.TemplateID });
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

}