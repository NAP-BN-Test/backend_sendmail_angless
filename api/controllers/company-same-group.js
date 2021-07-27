const Op = require('sequelize').Op;

var moment = require('moment');

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');
var user = require('../controllers/user');

var mMailListCampaign = require('../tables/maillist-campaign');
var mMailList = require('../tables/mail-list');
var mMailCampain = require('../tables/mail-campain');
var mCompany = require('../tables/company');
var mCompanyMailList = require('../tables/company-maillist');



var mModules = require('../constants/modules');
function checkDuplicate(array, elm) {
    var check = false;
    array.forEach(item => {
        if (item === elm) check = true;
    })
    return check;
}
module.exports = {
    getListCompanyAllGroup: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                mCompany(db).findAll().then(async company => {
                    var array = [];
                    for (var i = 0; i < company.length; i++) {
                        let count = await mCompanyMailList(db).count({
                            where: {
                                CompanyID: company[i].ID
                            }
                        })
                        if (count >= 2) {
                            await mCompanyMailList(db).findAll({
                                where: {
                                    CompanyID: company[i].ID
                                }
                            }).then(async data => {
                                var mailListArray = [];
                                data.forEach(item => {
                                    if (!checkDuplicate(mailListArray, item.MailListID)) {
                                        mailListArray.push(item.MailListID)
                                    }
                                })
                                for (var j = 0; j < mailListArray.length; j++) {
                                    var obj = {};
                                    let group = await mMailList(db).findOne({
                                        where: { ID: mailListArray[j] }
                                    })
                                    obj['idCompany'] = company[i].ID;
                                    obj['nameCompany'] = company[i].Name;
                                    obj['addressCompany'] = company[i].Address;
                                    obj['idGroup'] = group.ID;
                                    obj['nameGroup'] = group.Name;
                                    array.push(obj);
                                }
                            })
                        }
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: array
                    }
                    res.json(result)
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    deleteCompanyAddGroup: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let listID = JSON.parse(body.data);
                for (var i = 0; i < listID.length; i++) {
                    await mCompanyMailList(db).destroy({
                        where: [
                            { MailListID: listID[i].mailListID },
                            { CompanyID: listID[i].companyID }
                        ]
                    })
                }
                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    deleteCompanyDuplicateToGroup: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let listID = JSON.parse(body.listID);
                for (var i = 0; i < listID.length; i++) {
                    await mCompanyMailList(db).destroy({
                        where: [
                            { MailListID: listID[i].mailListID },
                            { CompanyID: listID[i].companyID }
                        ]
                    })
                }
                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    getListCompanyGroup: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let array = []
                let companyIDs = []
                await mCompanyMailList(db).findAll({
                    where: {
                        MailListID: body.groupID
                    },
                }).then(async data => {
                    for (let d = 0; d < data.length; d++) {
                        let countCompanyInGroup = await mCompanyMailList(db).count({
                            where: {
                                CompanyID: data[d].CompanyID
                            }
                        })
                        if (countCompanyInGroup > 1)
                            companyIDs.push(data[d].CompanyID)
                    }
                })
                for (let com = 0; com < companyIDs.length; com++) {
                    let CompanyMailList = mCompanyMailList(db);
                    CompanyMailList.belongsTo(mMailList(db), { foreignKey: 'MailListID', sourceKey: 'MailListID', as: 'group' })
                    CompanyMailList.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID', as: 'company' })
                    await CompanyMailList.findAll({
                        where: {
                            CompanyID: companyIDs[com]
                        },
                        include: [
                            {
                                model: mMailList(db),
                                required: false,
                                as: 'group'
                            },
                            {
                                model: mCompany(db),
                                required: false,
                                as: 'company'
                            },
                        ],
                    }).then(async data => {
                        let stt = 1;
                        for (let d = 0; d < data.length; d++) {
                            let obj = {
                                stt: stt.toString(),
                                addressbookID: data[d].CompanyID ? data[d].CompanyID : null,
                                name: data[d].company ? data[d].company.Name : '',
                                email: data[d].company ? data[d].company.Email : '',
                                address: data[d].company ? data[d].company.Address : '',
                                shortName: data[d].company ? data[d].company.ShortName : '',
                                phone: data[d].company ? data[d].company.Phone : '',
                                group: data[d].group ? data[d].group.Name : '',
                                groupID: data[d].group ? data[d].group.ID : null,
                            }
                            array.push(obj);
                            stt += 1
                        }
                    })
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
}