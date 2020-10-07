const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
const Result = require('../constants/result');
var moment = require('moment');
var database = require('../db');
let mMailmergeCampaign = require('../tables/mailmerge-campaign');
let mAdditionalInformation = require('../tables/additional-infomation');
let mTemplate = require('../tables/template');
var mModules = require('../constants/modules');
var mMailListDetail = require('../tables/mail-list-detail');
var mMailList = require('../tables/mail-list');
var mMailCampain = require('../tables/mail-campain');

let mUser = require('../tables/user');
const result = require('../constants/result');

function getInfoFromMailListDetail(db, MailListID) {
    var MailListDetail = mMailListDetail(db).findAll({
        where: { MailListID: MailListID },
        order: [
            ['TimeCreate', 'DESC']
        ]
    })
    return MailListDetail
}

async function getAdditionalInfomation(db, CampaignID) {
    let AdditionalInformation = mAdditionalInformation(db);

    AdditionalInformation.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'User' });
    AdditionalInformation.belongsTo(mMailCampain(db), { foreignKey: 'CampaignID', sourceKey: 'CampaignID', as: 'Campaign' });
    obj = []
    await AdditionalInformation.findAll({
        include: [
            { model: mUser(db), required: false, as: 'User' },
            { model: mMailCampain(db), required: false, as: 'Campaign' }

        ],
        where: {
            CampaignID: CampaignID,
        }
    }).then(result => {
        if (result) {
            result.forEach(data => {
                let FilingDate = '';
                if (data.FilingDate) {
                    FilingDate = moment(data.FilingDate).format('DD-MM-YYYY');
                }
                obj.push({
                    ID: data.ID,
                    OurRef: data.OurRef ? data.OurRef : null,
                    PAT: data.PAT ? data.PAT : null,
                    Applicant: data.Applicant ? data.Applicant : null,
                    ApplicationNo: data.ApplicationNo ? data.ApplicationNo : null,
                    ClassA: data.ClassA ? data.ClassA : null,
                    FilingDate: FilingDate,
                    PriorTrademark: data.PriorTrademark ? data.PriorTrademark : null,
                    Owner: data.Owner,
                    RegNo: data.RegNo ? data.RegNo : null,
                    ClassB: data.ClassB ? data.ClassB : null,
                    Firm: data.Firm ? data.Firm : null,
                    Address: data.Address ? data.Address : null,
                    Tel: data.Tel ? data.Tel : null,
                    Fax: data.Fax ? data.Fax : null,
                    Email: data.Email ? data.Email : null,
                    Status: data.Status ? data.Status : null,
                    Rerminder: data.Rerminder ? data.Rerminder : null,
                    UserID: data.UserID ? data.UserID : null,
                    UserName: data.User ? data.User.Name : "",
                    TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                    TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                    TimeCreate: mModules.toDatetime(data.TimeCreate),
                    TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                    Description: data.description,
                    Subject: data.Campaign.Subject ? data.Campaign.Subject : null,
                })
            })
        }
    })
    return obj;
}

module.exports = {
    // --------------------- Template -----------------------------------------------------------
    getAdditionalInfomation,
    getInfoFromMailListDetail,
    getListMailmergeTemplate: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let Template = mTemplate(db)
            let now = moment();
            Template.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'User' });
            Template.count().then(all => {
                Template.findAll({
                    include: [
                        { model: mUser(db), required: false, as: 'User' }
                    ],
                    order: [['TimeCreate', 'DESC']],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                }).then(data => {
                    let array = [];
                    if (data) {
                        data.forEach(item => {
                            array.push({
                                ID: item.ID,
                                Name: item.Name,
                                body: item.body ? item.body : null,
                                TimeStart: mModules.toDatetime(item.timeStart) ? item.timeStart : null,
                                TimeRemind: mModules.toDatetime(item.timeRemind) ? item.timeRemind : null,
                                TimeCreate: now.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                TimeUpdate: mModules.toDatetime(item.TimeUpdate),
                                Description: item.description ? item.description : null,
                                UserID: item.UserID ? item.UserID : null,
                                UserName: item.User ? item.User.Name : "",
                            });
                        });

                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array, all
                        }

                        res.json(result);
                    }
                })
            })
        })
    },
    addMailmergeTemplate: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mTemplate(db).create({
                Name: body.Name,
                body: body.body ? body.body : null,
                TimeStart: moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS') ? body.timeStart : null,
                TimeRemind: body.timeRemind ? moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS') : null,
                TimeCreate: now,
                TimeUpdate: now,
                UserID: body.userID,
                Description: body.description
            }).then(data => {
                obj = {
                    ID: data.ID,
                    Name: data.Name,
                    body: data.body ? data.body : null,
                    TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                    TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                    TimeCreate: mModules.toDatetime(data.TimeCreate),
                    TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                    UserID: data.userID,
                    Description: data.description ? data.description : null
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj
                }
                res.json(result);
            }, err => {
                var result = {
                    status: Constant.STATUS.FAIL,
                    message: Constant.MESSAGE.BINDING_ERROR,
                    ojb: err.fields
                }
                res.json(result);
            })
        })
    },
    updateMailmergeTemplate: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.body || body.body === '')
                    update.push({ key: 'body', value: body.body });
                if (body.Name || body.Name === '')
                    update.push({ key: 'Name', value: body.Name });
                if (body.Description || body.Description === '')
                    update.push({ key: 'Description', value: body.Description });
                if (body.UserID || body.UserID === '')
                    update.push({ key: 'UserID', value: body.UserID });
                if (body.TimeRemind || body.TimeRemind === '')
                    update.push({ key: 'TimeRemind', value: body.TimeRemind });
                if (body.TimeStart || body.TimeStart === '')
                    update.push({ key: 'TimeStart', value: body.TimeStart });

                database.updateTable(update, mTemplate(db), body.ID).then(response => {
                    if (response == 1) {
                        res.json(Result.ACTION_SUCCESS);
                    } else {
                        res.json(Result.SYS_ERROR_RESULT);
                    }
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    getDetailMailmergeTemplate: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let Template = mTemplate(db);
            Template.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'User' });

            Template.findOne({
                where: { ID: body.ID },
                include: [
                    { model: mUser(db), required: false, as: 'User' }
                ],
            }).then(data => {
                if (data) {
                    obj = {
                        ID: data.ID,
                        Name: data.Name,
                        body: data.body ? data.body : null,
                        TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                        TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                        TimeCreate: mModules.toDatetime(data.TimeCreate),
                        TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                        Description: data.description ? data.description : null,
                        UserID: data.UserID ? data.UserID : null,
                        UserName: data.User ? data.User.Name : "",
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        obj: obj
                    }
                    res.json(result);
                }
                else {
                    var result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.DATA_NOT_FOUND,
                    }
                    res.json(result);
                }
            })
        })
    },
    deleteMailmergeTemplate: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            if (body.MailmergeTemplateIDs) {
                let listMailmergeTemplate = JSON.parse(body.MailmergeTemplateIDs);
                let listMailmergeTemplateID = [];
                listMailmergeTemplate.forEach(item => {
                    listMailmergeTemplateID.push(Number(item + ""));
                });

                mTemplate(db).findOne({ where: { ID: body.userID } }).then(async user => {
                    // if (user.Roles == Constant.USER_ROLE.MANAGER) {
                    let update = [];
                    update.Template_ID = null;
                    await mMailCampain(db).update(update,
                        {
                            where: {
                                [Op.or]: {
                                    Template_ID: { [Op.in]: listMailmergeTemplateID }
                                }
                            }
                        });
                    await mTemplate(db).destroy(
                        {
                            where: {
                                [Op.or]: {
                                    ID: { [Op.in]: listMailmergeTemplateID }
                                }
                            }
                        },
                    ).then(() => {
                        res.json(Result.ACTION_SUCCESS);
                    });
                    // }
                });
            }
        })
    },
    getAllMailmergeTemplate: (req, res) => {//take this list for dropdown
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mTemplate(db).findAll().then(data => {
                var array = [];

                data.forEach(elm => {
                    array.push({
                        id: elm['ID'],
                        name: elm['Name'],
                    })
                });
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array
                }
                res.json(result)
            })

        })
    },
    getDatafromInformation: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            var mail_list_detail = [];
            var information = [];
            if (body.MailListID) {
                var MailList = await mMailList(db).findAll({
                    where: {
                        ID: body.MailListID
                    },
                });
                let detail = await getInfoFromMailListDetail(db, body.MailListID);
                let ListDataId = []
                detail.forEach(item => {
                    mail_list_detail.push(item.dataValues);
                    if (item.dataValues.DataID)
                        ListDataId.push(item.dataValues.DataID);
                })
                information = await getAdditionalInfomation(db, ListDataId);
                let result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    name_mail_list: MailList[0].dataValues.Name,
                    mail_list_detail,
                    information
                }
                res.json(result);
            }
        })
    }
}