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
                var whereObj = {};
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
                                }
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
                            if (data.items[i].fields['name'] === 'Full Name') {
                                userFind['Name'] = data.items[i]['searchFields']
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
                            if (data.items[i].fields['name'] === 'Address') {
                                userFind['Address'] = {
                                    [Op.eq]: data.items[i]['searchFields']
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
                    }
                    if (arraySearchOr.length > 0)
                        whereObj[Op.or] = arraySearchOr
                    if (arraySearchAnd.length > 0)
                        whereObj[Op.and] = arraySearchAnd
                    if (arraySearchNot.length > 0)
                        whereObj[Op.not] = arraySearchNot
                }
                console.log(whereObj);
                mCompany(db).findAll({
                    where: whereObj
                }).then(async company => {
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
                            { MailListID: listID[i].groupID },
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