const Constant = require('../constants/constant');
const Op = require('sequelize').Op;

const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');
let mUser = require('../tables/user');
var mModules = require('../constants/modules');
var mAmazon = require('../controllers/amazon');
var mContact = require('../tables/contact');
var mCheckMail = require('../controllers/check-mail');
var mUserFollow = require('../tables/user-follow');
var mMailCampain = require('../tables/mail-campain');
let mTemplate = require('../tables/template');
const fs = require('fs');
let mAdditionalInformation = require('../tables/additional-infomation');
var mMailListDetail = require('../tables/mail-list-detail');
const result = require('../constants/result');
var mMailResponse = require('../tables/mail-response');
const Sequelize = require('sequelize');
var mCampaignGroups = require('../tables/campaign-groups');
var mGroupCampaign = require('../tables/group-campaign');
var mContact = require('../tables/contact');
var mCompany = require('../tables/company');

function handleNumber(number) {
    if (number < 10) return "000" + (number + 1).toString();
    if (number >= 10 && number < 100) return "00" + (number + 1).toString();
    if (number >= 100 && number < 1000) return "0" + (number + 1).toString();
    if (number >= 1000) return (number + 1).toString();
}

module.exports = {
    getListAdditionalInformation: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let AdditionalInformation = mAdditionalInformation(db);
            AdditionalInformation.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'User' });
            AdditionalInformation.belongsTo(mMailCampain(db), { foreignKey: 'CampaignID', sourceKey: 'CampaignID', as: 'Campaign' });
            let MailCampain = mMailCampain(db)
            MailCampain.belongsTo(mTemplate(db), { foreignKey: 'TemplateID', sourceKey: 'TemplateID', as: 'Template' });
            var where = []
            if (body.CampaignID)
                where.push({
                    CampaignID: body.CampaignID
                });
            AdditionalInformation.count().then(all => {
                AdditionalInformation.findAll({
                    include: [
                        { model: mUser(db), required: false, as: 'User' },
                    ],
                    order: [
                        ['TimeCreate', 'DESC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage),
                    where
                }).then(async data => {
                    let array = [];
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            // lấy dữ liệu unsubrice
                            let respon = await mMailResponse(db).findOne({
                                order: [
                                    Sequelize.literal('max(TimeCreate) DESC'),
                                ],
                                group: ['CompanyID', 'Reason', 'ID', 'Type', 'MailCampainID', 'MailListDetailID', 'TimeCreate', 'TypeSend', 'MaillistID', 'IDGetInfo', 'Email', 'TickSendMail'],
                                where: {
                                    [Op.and]: [
                                        { MailCampainID: data[i].CampaignID },
                                        { Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE }
                                    ]
                                }
                            })

                            let listNameCampaign = '';
                            let count = 0;
                            var check = await AdditionalInformation.findAll({
                                include: [
                                    { model: MailCampain, required: false, as: 'Campaign' }
                                ],
                                where: {
                                    ContactID: data[i].ContactID,
                                    [Op.not]: {
                                        CampaignID: data[i].CampaignID,
                                    }
                                },
                            })
                            if (check[0])
                                check.forEach(item => {
                                    if (item.Campaign) {
                                        count += 1;
                                        count > 1 ? listNameCampaign += ', [' + item.Campaign.Name + ']' : listNameCampaign += '[' + item.Campaign.Name + ']';
                                    }
                                })
                            array.push({
                                ID: data[i].ID,
                                OurRef: data[i].OurRef,
                                PAT: data[i].PAT ? data[i].PAT : null,
                                Applicant: data[i].Applicant ? data[i].Applicant : null,
                                ApplicationNo: data[i].ApplicationNo ? data[i].ApplicationNo : null,
                                ClassA: data[i].ClassA ? data[i].ClassA : null,
                                FilingDate: data[i].FilingDate ? moment(data[i].FilingDate).format('DD/MM/YYYY') : null,
                                DateReminder: data[i].DateReminder ? moment(data[i].DateReminder).format('DD/MM/YYYY') : null,
                                DateSend: data[i].DateSend ? moment(data[i].DateSend).format('DD/MM/YYYY') : null,
                                Result: data[i].Result ? data[i].Result : null,
                                PriorTrademark: data[i].PriorTrademark ? data[i].PriorTrademark : null,
                                Owner: data[i].Owner,
                                RegNo: data[i].RegNo ? data[i].RegNo : null,
                                ClassB: data[i].ClassB ? data[i].ClassB : null,
                                Firm: data[i].Firm ? data[i].Firm : null,
                                Address: data[i].Address ? data[i].Address : null,
                                Tel: data[i].Tel ? data[i].Tel : null,
                                Fax: data[i].Fax ? data[i].Fax : null,
                                Email: data[i].Email ? data[i].Email : null,
                                Status: data[i].Status ? data[i].Status : null,
                                Rerminder: data[i].Rerminder ? data[i].Rerminder : null,
                                UserID: data[i].UserID ? data[i].UserID : null,
                                UserName: data[i].User ? data[i].User.Name : "",
                                TimeStart: mModules.toDatetime(data[i].timeStart) ? data[i].timeStart : null,
                                TimeRemind: mModules.toDatetime(data[i].timeRemind) ? data[i].timeRemind : null,
                                TimeCreate: mModules.toDatetime(data[i].TimeCreate),
                                TimeUpdate: mModules.toDatetime(data[i].TimeUpdate),
                                Description: data[i].description,
                                checkDuplicate: check[0] ? true : false,
                                nameCampaign: listNameCampaign,
                                markN: data[i].MarkN0 ? data[i].MarkN0 : null,
                                markName: data[i].MarkName ? data[i].MarkName : null,
                                holderName: data[i].HolderName ? data[i].HolderName : null,
                                representative: data[i].Representative ? data[i].Representative : null,
                            });

                        }
                        let nameCampaign = await MailCampain.findOne({
                                where: { ID: body.CampaignID },
                                include: [
                                    { model: mTemplate(db), required: false, as: 'Template' },
                                ],
                            })
                            // var status = await MailCampain.findOne({
                            //     where: {
                            //         ID: body.CampaignID,
                            //     }
                            // })
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array,
                            all,
                            statusCampaign: nameCampaign.StatusCampaign,
                            bodyCampaign: nameCampaign.Template ? nameCampaign.Template.body : '',
                            nameCampaign: nameCampaign ? nameCampaign.Name : '',
                        }
                        res.json(result);
                    }
                })
            })
        })
    },
    addAdditionalInformation: (req, res) => {
        let body = req.body;
        console.log(body);
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let errorEmail = '';
            let User = await mUser(db).findOne({ where: { ID: body.userID } })
            let NameAcronym = User.Username ? User.Username + '/' : '';
            let campaign = await mMailCampain(db).findOne({
                where: { ID: body.mailMergeCampaignID }
            })
            let OurRef = '';

            if (campaign) {
                let groupCampaign = await mCampaignGroups(db).findOne({
                    where: { ID: campaign.IDGroup1 }
                })
                let group = await (mGroupCampaign(db).findOne({
                    where: { ID: groupCampaign.IDGroup }
                }))
                if (groupCampaign)
                    OurRef = group.Name + groupCampaign.Code + '/' + moment().format('YYYY') + '/';
                else
                    OurRef = '' + NameAcronym;
            }
            var number = 1;
            var addInf = await mAdditionalInformation(db).findOne({
                order: [
                    Sequelize.literal('max(TimeCreate) DESC'),
                ],
                group: ['MarkN0', 'MarkName', 'HolderName', 'Representative', 'OurRef', 'ContactID', 'CampaignID', 'ID', 'PAT', 'Applicant', 'ApplicationNo', 'ClassA', 'FilingDate', 'DateSend', 'Result', 'DateReminder', 'PriorTrademark', 'CampaignID', 'Description', 'TimeUpdate', 'TimeCreate', 'TimeRemind', 'TimeStart', 'UserID', 'Rerminder', 'Status', 'Email', 'Fax', 'Tel', 'Address', 'Firm', 'ClassB', 'RegNo', 'Owner'],
            });
            if (addInf)
                number = Number(addInf.OurRef.substr(-4));
            else
                number = 0;
            mAdditionalInformation(db).create({
                OurRef: OurRef + handleNumber(number),
                CampaignID: body.CampaignID,
                PAT: body.PAT ? body.PAT : null,
                Applicant: body.Applicant ? body.Applicant : null,
                ApplicationNo: body.ApplicationNo ? body.ApplicationNo : null,
                ClassA: body.ClassA ? body.ClassA : null,
                FilingDate: body.FilingDate ? body.FilingDate : null,
                // DateSend: body.DateSend = '' ? body.DateSend : null,
                Result: body.Result ? body.Result : null,
                // DateReminder: body.DateReminder = '' ? body.DateReminder : null,
                PriorTrademark: body.PriorTrademark ? body.PriorTrademark : null,
                Owner: body.Owner,
                RegNo: body.RegNo ? body.RegNo : null,
                ClassB: body.ClassB ? body.ClassB : null,
                Firm: body.Firm ? body.Firm : null,
                Address: body.Address ? body.Address : null,
                Tel: body.Tel ? body.Tel : null,
                Fax: body.Fax ? body.Fax : null,
                Email: body.Email ? body.Email : null,
                Status: body.Status ? body.Status : null,
                Rerminder: body.Rerminder ? body.Rerminder : null,
                UserID: body.userID ? body.userID : null,
                TimeStart: moment(body.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS') ? body.timeStart : null,
                TimeRemind: moment(body.timeRemind).format('YYYY-MM-DD HH:mm:ss.SSS') ? body.timeRemind : null,
                TimeCreate: now,
                TimeUpdate: now,
                Description: body.description,
                CampaignID: Number(body.mailMergeCampaignID),
                Representative: body.representative ? body.representative : null,
                HolderName: body.holderName ? body.holderName : null,
                MarkName: body.markName ? body.markName : null,
                MarkN0: body.markN ? body.markN : null,
            }).then(async data => {
                obj = {
                    OurRef: data.OurRef ? data.OurRef : null,
                    PAT: data.PAT ? data.PAT : null,
                    Applicant: data.Applicant ? data.Applicant : null,
                    ApplicationNo: data.ApplicationNo ? data.ApplicationNo : null,
                    ClassA: data.ClassA ? data.ClassA : null,
                    FilingDate: data.FilingDate ? data.FilingDate : null,
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
                    TimeStart: mModules.toDatetime(data.timeStart) ? data.timeStart : null,
                    TimeRemind: mModules.toDatetime(data.timeRemind) ? data.timeRemind : null,
                    TimeCreate: mModules.toDatetime(data.TimeCreate),
                    TimeUpdate: mModules.toDatetime(data.TimeUpdate),
                    Description: mModules.toDatetime(data.description),
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj,
                    emailExist: true ? errorEmail === '' : false

                }
                await mMailListDetail(db).create({
                    Email: data.Email ? data.Email : null,
                    OwnerID: data.UserID ? data.UserID : null,
                    TimeCreate: now,
                    MailListID: body.MailListID,
                    Name: data.OurRef ? data.OurRef : null,
                    DataID: data.ID,
                })
                res.json(result);
            })
        })
    },
    updateAdditionalInformation: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let errorEmail = '';
                try {
                    let update = [];
                    if (body.PAT || body.PAT === '')
                        update.push({ key: 'PAT', value: body.PAT.toString() });
                    if (body.Applicant || body.Applicant === '')
                        update.push({ key: 'Applicant', value: body.Applicant });
                    if (body.representative || body.representative === '')
                        update.push({ key: 'Representative', value: body.representative });
                    if (body.holderName || body.holderName === '')
                        update.push({ key: 'HolderName', value: body.holderName });
                    if (body.markName || body.markName === '')
                        update.push({ key: 'MarkName', value: body.markName });
                    if (body.markN || body.markN === '')
                        update.push({ key: 'MarkN0', value: body.markN });
                    if (body.ApplicationNo || body.ApplicationNo === '')
                        update.push({ key: 'ApplicationNo', value: body.ApplicationNo });
                    if (body.ClassA || body.ClassA === '')
                        update.push({ key: 'ClassA', value: body.ClassA });
                    if (body.FilingDate || body.FilingDate == '') {
                        if (body.FilingDate == '')
                            update.push({ key: 'FilingDate', value: null });
                        else {
                            let time = moment(body.FilingDate).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                            update.push({ key: 'FilingDate', value: time });
                        }
                    }
                    if (body.DateSend || body.DateSend == '') {
                        if (body.DateSend == '')
                            update.push({ key: 'DateSend', value: null });
                        else {
                            let time = moment(body.DateSend).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                            update.push({ key: 'DateSend', value: time });
                        }
                    }
                    if (body.DateReminder || body.DateReminder == '') {
                        if (body.DateReminder == '')
                            update.push({ key: 'DateReminder', value: null });
                        else {
                            let time = moment(body.DateReminder).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                            update.push({ key: 'DateReminder', value: time });
                        }
                    }
                    if (body.Result || body.Result === '')
                        update.push({ key: 'Result', value: body.Result.toString() });
                    if (body.PriorTrademark || body.PriorTrademark === '')
                        update.push({ key: 'PriorTrademark', value: body.PriorTrademark.toString() });
                    if (body.Owner || body.Owner === '')
                        update.push({ key: 'Owner', value: body.Owner });
                    if (body.RegNo || body.RegNo === '')
                        update.push({ key: 'RegNo', value: body.RegNo });
                    if (body.ClassB || body.ClassB === '')
                        update.push({ key: 'ClassB', value: body.ClassB });
                    if (body.Firm || body.Firm === '')
                        update.push({ key: 'Firm', value: body.Firm });
                    if (body.Address || body.Address === '')
                        update.push({ key: 'Address', value: body.Address });
                    if (body.Tel || body.Tel === '')
                        update.push({ key: 'Tel', value: body.Tel });
                    if (body.Fax || body.Fax === '')
                        update.push({ key: 'Fax', value: body.Fax });
                    if (errorEmail === '')
                        update.push({ key: 'Email', value: body.Email });
                    if (body.Status || body.Status === '')
                        update.push({ key: 'Status', value: body.Status });
                    if (body.Rerminder || body.Rerminder === '')
                        update.push({ key: 'Rerminder', value: body.Rerminder });
                    if (body.userID || body.userID === '')
                        update.push({ key: 'UserID', value: body.userID });
                    if (body.Description || body.Description === '')
                        update.push({ key: 'Description', value: body.Description });
                    database.updateTable(update, mAdditionalInformation(db), body.ID).then(response => {
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
            } catch (error) {
                console.log(error);
                res.json(Result.ERROR_RESULT)

            }
        })
    },
    getDetailAdditionalInformation: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let AdditionalInformation = mAdditionalInformation(db);

            AdditionalInformation.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'User' });
            AdditionalInformation.findOne({
                include: [
                    { model: mUser(db), required: false, as: 'User' },
                ],
                where: { ID: body.ID },
            }).then(data => {
                if (data) {
                    obj = {
                        ID: data.ID,
                        OurRef: data[i].OurRef + handleNumber(i),
                        PAT: data.PAT ? data.PAT : null,
                        Applicant: data.Applicant ? data.Applicant : null,
                        ApplicationNo: data.ApplicationNo ? data.ApplicationNo : null,
                        ClassA: data.ClassA ? data.ClassA : null,
                        FilingDate: data.FilingDate ? data.FilingDate : null,
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
                        Description: mModules.toDatetime(data.description)
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: obj
                    }
                    res.json(result);
                } else {
                    var result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.DATA_NOT_FOUND,
                    }
                    res.json(result);
                }
            })
        })
    },
    deleteAdditionalInformation: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (body.AdditionalInformationIDs) {
                let listAdditionalInformation = JSON.parse(body.AdditionalInformationIDs);
                let listAdditionalInformationID = [];
                listAdditionalInformation.forEach(item => {
                    listAdditionalInformationID.push(Number(item + ""));
                });

                mUser(db).findOne({ where: { ID: body.userID } }).then(async user => {
                    await mAdditionalInformation(db).destroy({
                        where: {
                            [Op.or]: {
                                ID: {
                                    [Op.in]: listAdditionalInformationID
                                }
                            }
                        }
                    }, ).then(() => {
                        res.json(Result.ACTION_SUCCESS);
                    });

                });
            }
        })
    },
    getAllAdditionalInformation: (req, res) => { //take this list for dropdown
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mAdditionalInformation(db).findAll().then(data => {
                var array = [];
                var i = 1;
                data.forEach(elm => {
                    array.push({
                        id: elm['ID'],
                        OurRef: elm.OurRef + handleNumber(i),
                        email: elm.Email,
                    })
                    i += 1;
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
    createImformationfromContact: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            let contact = mContact(db);
            contact.hasMany(mUserFollow(db), { foreignKey: 'ContactID' })
            var listContactID = JSON.parse(body.listContactID);
            let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            let User = await mUser(db).findOne({ where: { ID: body.userID } })
            let NameAcronym = User.NameAcronym ? User.NameAcronym + '/' : '';
            let campaign = await mMailCampain(db).findOne({
                where: { ID: body.CampaignID }
            })
            let groupCampaign = await mCampaignGroups(db).findOne({
                where: { ID: campaign.IDGroup1 }
            })
            let group = await (mGroupCampaign(db).findOne({
                where: { ID: groupCampaign.IDGroup }
            }))
            let OurRef = '';
            if (groupCampaign)
                OurRef = group.Name + '/' + groupCampaign.Name + '/';
            else
                OurRef = '' + NameAcronym;

            await contact.findAll({
                where: {
                    [Op.or]: {
                        ID: {
                            [Op.in]: listContactID
                        }
                    }
                },
                include: {
                    model: mUserFollow(db),
                    required: false,
                    where: { UserID: body.userID, Type: 2 }
                }
            }).then(async data => {
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        await mAdditionalInformation(db).create({
                            OurRef: OurRef,
                            Address: data[i].Address ? data[i].Address : null,
                            Email: data[i].Email ? data[i].Email : null,
                            Owner: data[i].Name ? data[i].Name : null,
                            Tel: data[i].Phone ? data[i].Phone : null,
                            Fax: data[i].Fax ? data[i].Fax : null,
                            TimeCreate: now,
                            TimeUpdate: now,
                            CampaignID: body.CampaignID,
                            ContactID: data[i].ID
                        })
                    }
                    let result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                    }
                    res.json(result)
                } else {
                    let result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.DATA_NOT_FOUND,
                    }
                    res.json(result)
                }
            })
        })
    },
    // delete_image
    deleteImage: (req, res) => {
        // delete a file
        var body = req.body;
        // var file = body.nameImage.replace("http://dbdev.namanphu.vn:1357/ageless_sendmail/", "")
        // fs.unlink("C:/images_services/ageless_sendmail/" + file, (err) => {
        //     if (err) console.log(err);
        // });
    },
    getEmailFromCompany: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                mCompany(db).findOne({ where: { id: body.id } }).then(async data => {
                    var array = [];
                    if (data) {
                        array.push({
                            name: data.Email,
                            phone: data.Phone,
                            fax: data.Fax
                        })
                        await mContact(db).findAll({ where: { CompanyID: body.id } }).then(contact => {
                            contact.forEach(item => {
                                array.push({
                                    name: item.Email,
                                    phone: data.Phone,
                                    fax: data.Fax
                                })
                            })
                        })
                    }
                    let result = {
                        array: array,
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                    }
                    console.log(result);
                    res.json(result)
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    }
}