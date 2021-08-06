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

async function getAdditionalInfomation(db, CampaignID, page, itemPerPage) {
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
        },
        offset: itemPerPage * (page - 1),
        limit: itemPerPage
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
                    Result: data.Result,
                    Subject: data.Campaign.Subject ? data.Campaign.Subject : null,
                })
            })
        }
    })
    return obj;
}
async function deleteImageResidual(listLink, listLinkNew) {
    for (var i = 0; i < listLink.length; i++) {
        if (!checkDuplicate(listLinkNew, listLink[i])) {
            await deleteImage(listLink[i]);
        }
    }
}
async function getListLinkImage(db, templateID) {
    try {
        var template = await mTemplate(db).findOne({
            where: { ID: templateID }
        })
        var keyField = []
        if (template) {
            let body = template.Body;
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
                                TimeCreate: moment(item.TimeUpdate).subtract(7, 'hours').format("DD/MM/YYYY HH:mm:ss"),
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
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
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
                if (body.body || body.body === '') {
                    var listLink = await getListLinkImage(db, body.ID);
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
                    // có dòng text = text.replace(matches[1], linkImage); là k chạy qua/ not hiểu
                    console.log(text);
                    update.push({ key: 'body', value: text });
                    await deleteImageResidual(listLink, listLinkNew);
                }
                console.log(update, body.ID);
                database.updateTable(update, mTemplate(db), body.ID).then(response => {
                    console.log(response);
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
                    console.log(obj);
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
                mTemplate(db).findOne({ where: { ID: body.userID } }).then(async user => {
                    await mMailCampain(db).update({
                        TemplateID: null,
                    }, {
                        where: {
                            TemplateID: { [Op.in]: listMailmergeTemplate },
                        }
                    });
                    await mMailCampain(db).update({
                        IDTemplateReminder: null,
                    }, {
                        where: {
                            IDTemplateReminder: { [Op.in]: listMailmergeTemplate }
                        }
                    });
                    await mTemplate(db).destroy(
                        {
                            where: {
                                ID: { [Op.in]: listMailmergeTemplate }
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
                information = await getAdditionalInfomation(db, ListDataId, 1, 10000);
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