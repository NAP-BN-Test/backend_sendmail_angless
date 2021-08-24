const Op = require('sequelize').Op;

var moment = require('moment');

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');
var user = require('../controllers/user');


var mCity = require('../tables/city');

var mActivity = require('../controllers/activity');
var mCountry = require('../tables/country');

var mCompany = require('../tables/company');
var mContact = require('../tables/contact');
var mCompanyChild = require('../tables/company-child');
var mUser = require('../tables/user');
var mUserFollow = require('../tables/user-follow');
var mDeal = require('../tables/deal');
var mDealStage = require('../tables/deal-stage');

var rmCompanyChild = require('../tables/company-child');
var rmCall = require('../tables/call');
var rmEmail = require('../tables/email');
var rmMeet = require('../tables/meet');
var rmNote = require('../tables/note');
var rmContact = require('../tables/contact');
var rmDeal = require('../tables/deal');
var rmUserFlow = require('../tables/user-follow');
var mCategoryCustomer = require('../tables/category-customer');


var mCompanyMailList = require('../tables/company-maillist');
var mMailListCampaign = require('../tables/maillist-campaign');
var mMailList = require('../tables/mail-list');
var mMailResponse = require('../tables/mail-response');
var mCompanyRelationship = require('../tables/company-relationship');





var mModules = require('../constants/modules')
async function getDetailCompanyOld(db, companyNewID) {
    let company = mCompany(db);
    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
    company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
    company.belongsTo(mCountry(db), { foreignKey: 'CountryID', sourceKey: 'CountryID', as: 'Country' });
    company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
    company.hasMany(mDeal(db), { foreignKey: 'CompanyID' });
    var data = await company.findOne({
        where: { NewCompanyID: companyNewID },
        include: [
            { model: mCountry(db), required: false, as: 'Country' },
            { model: mUser(db), required: false, as: 'CreateUser' },
            { model: mUser(db), required: false, as: 'AssignUser' },
            {
                model: mUserFollow(db),
                // required: body.companyType == 3 ? true : false,
                // where: { UserID: body.userID, Type: 1, Follow: true }
            },
            { model: mCity(db), required: false },
        ],
        order: [['ID', 'DESC']],
    });
    let obj = {}
    if (data)
        obj = {
            id: data.ID,
            name: data.Name,

            ownerID: data.UserID,
            ownerName: data.CreateUser ? data.CreateUser.Username : "",

            assignID: data.AssignID,
            assignName: data.AssignUser ? data.AssignUser.Username : "",

            address: data.Address,
            phone: data.Phone,
            email: data.Email,
            website: data.Website,
            timeCreate: moment(data.TimeCreate).subtract(7, 'hours').format("DD/MM/YYYY HH:mm:ss"),

            cityID: data.City ? data.City.ID : -1,
            city: data.City ? data.City.Name : "",
            CountryID: data.Country ? data.Country.ID : "",
            Country: data.Country ? data.Country.Name : "",

            follow: data.UserFollows[0] ? data.UserFollows[0]['Follow'] : false,
            checked: false,
            companyType: data.Type == 0 ? 'Có' : 'Không',
            lastActivity: mModules.toDatetime(data.LastActivity),
            Fax: data.Fax,
            properties: data.Role,
            newCompanyID: data.NewCompanyID ? data.NewCompanyID : null,
            oldCompanyID: data.OldCompanyID ? data.OldCompanyID : null,
        }
    return obj
}

module.exports = {
    // import_addressbook
    importAddressbook: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                body.data = body.data.replace(/!!@@##/g, '&')
                let data = JSON.parse(body.data);
                var company = mCompany(db);
                let checkResult = true;
                let arrayDuplicate = []
                for (var i = 0; i < data.length; i++) {
                    var cityID = null;
                    if (data[i].CityCode) {
                        var city = await mCity(db).findOne({ where: { Code: data[i].CityCode } });
                        if (city) cityID = city.ID;
                        else {
                            await mCity(db).create({
                                Code: data[i].CityCode,
                            }).then(data => {
                                cityID = data.ID
                            })
                        }
                    }
                    var countryID = null;
                    if (data[i]['Country']) {
                        var countryObj = await mCountry(db).findOne({ where: { Code: data[i]['Country'] } });
                        if (countryObj) {
                            countryID = countryObj.ID
                        }
                        else {
                            await mCountry(db).create({
                                Code: data[i]['Country'],
                            }).then(data => {
                                countryID = data.ID
                            })
                        }
                    }
                    let check = await company.findOne({
                        where: {
                            Name: data[i]['Name']
                        }
                    })
                    if (!check) {
                        let companyObj = await company.create({
                            UserID: body.userID ? body.userID : null,
                            Name: data[i]['Name'],
                            // ShortName: data[i].shortName,
                            Phone: data[i]['Tel'] ? data[i]['Tel'].toString().replace(/plus/g, '+') : '',
                            Email: data[i]['Other emails'] ? data[i]['Other emails'] : '',
                            Address: data[i].Address ? data[i].Address : '',
                            CityID: cityID ? cityID : null,
                            TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                            Type: 1,
                            CountryID: countryID ? countryID : null,
                            Fax: data[i]['Fax'] ? data[i]['Fax'].toString().replace(/plus/g, '+') : '',
                            Role: data[i]['Agent/ Company'] ? data[i]['Agent/ Company'] : '',
                            Note: data[i].Note ? data[i].Note : '',
                        })
                        await mContact(db).create({
                            Email: data[i]['Contact Persons1'] ? data[i]['Contact Persons1'] : '',
                            Name: data[i]['Email1'] ? data[i]['Email1'] : '',
                            CompanyID: companyObj.ID,
                        })
                        await mContact(db).create({
                            Email: data[i]['Contact Persons2'] ? data[i]['Contact Persons2'] : '',
                            Name: data[i]['Email2'] ? data[i]['Email2'] : '',
                            CompanyID: companyObj.ID,
                        })
                        await mContact(db).create({
                            Email: data[i]['Contact Persons3'] ? data[i]['Contact Persons3'] : '',
                            Name: data[i]['Email3'] ? data[i]['Email3'] : '',
                            CompanyID: companyObj.ID,
                        })
                    }
                    else {
                        let arrayContact = []
                        arrayContact.push({
                            Email: data[i]['Contact Persons1'] ? data[i]['Contact Persons1'] : '',
                            Name: data[i]['Email1'] ? data[i]['Email1'] : '',
                            // CompanyID: companyObj.ID,
                        })
                        arrayContact.push({
                            Email: data[i]['Contact Persons2'] ? data[i]['Contact Persons2'] : '',
                            Name: data[i]['Email2'] ? data[i]['Email2'] : '',
                            // CompanyID: companyObj.ID,
                        })
                        arrayContact.push({
                            Email: data[i]['Contact Persons3'] ? data[i]['Contact Persons3'] : '',
                            Name: data[i]['Email3'] ? data[i]['Email3'] : '',
                            // CompanyID: companyObj.ID,
                        })
                        checkResult = false
                        arrayDuplicate.push({
                            STT: data[i]['STT'],
                            UserID: body.userID ? body.userID : null,
                            Name: data[i]['Name'],
                            // ShortName: data[i].shortName,
                            Phone: data[i]['Tel'] ? data[i]['Tel'].replace(/plus/g, '+') : '',
                            Email: data[i]['Other emails'] ? data[i]['Other emails'] : '',
                            Address: data[i].Address ? data[i].Address : '',
                            CityID: cityID ? cityID : null,
                            TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                            Type: 1,
                            CountryID: countryID ? countryID : null,
                            Fax: data[i]['Fax'] ? data[i]['Fax'].replace(/plus/g, '+') : '',
                            Role: data[i]['Agent/ Company'] ? data[i]['Agent/ Company'] : '',
                            Note: data[i].Note ? data[i].Note : '',
                            arrayContact: arrayContact,
                        })
                    }
                }
                var result = {}
                if (checkResult == true)
                    result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                    }
                else
                    result = {
                        status: Constant.STATUS.FAIL,
                        message: 'Addressbook đã tồn tại. Vui lòng kiểm tra lại!',
                        arrayDuplicate: arrayDuplicate,
                    }
                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },

    getListNameCompany: (req, res) => {

        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                user.checkUser(body.ip, body.dbName, body.userID).then(async role => {
                    var data = await mCompany(db).findAll({
                        order: [['ID', 'DESC']],
                        where: { NewCompanyID: null },
                        limit: 1000,
                    });
                    var array = [];
                    data.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            address: elm.Address,
                        })
                    });

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

    getListCompany: (req, res) => {

        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                user.checkUser(body.ip, body.dbName, body.userID).then(async role => {
                    let company = mCompany(db);
                    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                    company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
                    // company.belongsTo(mDealStage(db), { foreignKey: 'StageID', sourceKey: 'StageID' });
                    company.belongsTo(mCategoryCustomer(db), { foreignKey: 'CategoryID', sourceKey: 'CategoryID' });

                    company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
                    company.hasMany(mDeal(db), { foreignKey: 'CompanyID' });

                    let whereSearch = [];
                    if (body.searchKey) {
                        whereSearch = [
                            { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Address: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Phone: { [Op.like]: '%' + body.searchKey + '%' } },
                            { ShortName: { [Op.like]: '%' + body.searchKey + '%' } },
                        ];
                    } else {
                        whereSearch = [
                            { Name: { [Op.ne]: '%%' } },
                            { Address: { [Op.like]: '%%' } },
                            { Phone: { [Op.like]: '%%' } },
                            { ShortName: { [Op.like]: '%%' } },
                        ];
                    }

                    let userFind = [];
                    if (body.userIDFind) {
                        userFind.push({ UserID: body.userIDFind })
                    }
                    // if (body.stageID) {
                    //     userFind.push({ StageID: body.stageID })
                    // }
                    if (body.cityID) {
                        userFind.push({ CityID: body.cityID })
                    }
                    if (role == Constant.USER_ROLE.GUEST) {
                        userFind.push({ UserID: body.userID })
                    }

                    if (body.logistic)
                        userFind.push({ Name: { [Op.like]: '%logistic%' } })

                    if (body.transport)
                        userFind.push({ Name: { [Op.like]: '%transport%' } })

                    let whereAll;
                    let whereAllAssign;
                    let whereAssign;
                    let whereUnAssign;
                    let whereFollow;
                    let whereCustomer;

                    if (body.timeFrom) {
                        whereAll = {
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        };
                        whereAllAssign = {
                            UserID: { [Op.ne]: null },
                            [Op.or]: whereSearch,
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        };
                        whereAssign = {
                            UserID: body.userID,
                            [Op.or]: whereSearch,
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        };
                        whereUnAssign = {
                            UserID: { [Op.eq]: null },
                            [Op.or]: whereSearch,
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        };
                        whereFollow = {
                            [Op.or]: whereSearch,
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        }
                        whereCustomer = {
                            // StageID: 8,
                            [Op.or]: whereSearch,
                            TimeCreate: { [Op.between]: [new Date(body.timeFrom), new Date(body.timeTo)] },
                            [Op.and]: userFind
                        }
                    } else {
                        whereAll = {
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        };
                        whereAllAssign = {
                            UserID: { [Op.ne]: null },
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        };
                        whereAssign = {
                            UserID: body.userID,
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        };
                        whereUnAssign = {
                            UserID: { [Op.eq]: null },
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        };
                        whereFollow = {
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        }
                        whereCustomer = {
                            // StageID: 8,
                            [Op.or]: whereSearch,
                            [Op.and]: userFind
                        }
                    }

                    var all = await company.count({ where: whereAll });
                    var unassign = await company.count({ where: whereUnAssign });
                    var assignAll = await company.count({ where: whereAllAssign });
                    var assign = await company.count({ where: whereAssign });
                    var customer = await company.count({ where: whereCustomer });
                    var follow = await company.count({
                        include: [
                            {
                                model: mUserFollow(db),
                                where: { UserID: body.userID, Type: 1, Follow: true }
                            }
                        ],
                        where: whereFollow,
                    });

                    let where;
                    if (body.searchKey) {
                        if (body.companyType == 2) {//unassign
                            where = whereUnAssign
                        } else if (body.companyType == 4) {//assign
                            where = whereAssign
                        } else if (body.companyType == 5) {//assign all
                            where = whereAllAssign
                        } else if (body.companyType == 6) {//assign all
                            where = whereCustomer
                        } else { // all
                            where = whereAll
                        }
                    } else {
                        if (body.companyType == 2) {//unassign
                            where = whereUnAssign
                        } else if (body.companyType == 4) {//assign
                            where = whereAssign
                        } else {// all
                            where = whereAll
                        }
                    }
                    var data = await company.findAll({
                        include: [
                            { model: mUser(db), required: false, as: 'CreateUser' },
                            { model: mUser(db), required: false, as: 'AssignUser' },
                            {
                                model: mUserFollow(db),
                                required: body.companyType == 3 ? true : false,
                                where: { UserID: body.userID, Type: 1, Follow: true }
                            },
                            { model: mCity(db), required: false },
                            { model: mCategoryCustomer(db), required: false },
                            // {
                            //     model: mDealStage(db),
                            //     required: false,
                            // },
                        ],
                        where: where,
                        order: [['ID', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });

                    var array = [];
                    data.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,

                            ownerID: elm.UserID,
                            ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                            assignID: elm.AssignID,
                            assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                            address: elm.Address,
                            phone: elm.Phone,
                            email: elm.Email,
                            website: elm.Website,
                            timeCreate: mModules.toDatetime(elm.TimeCreate),

                            cityID: elm.City ? elm.City.ID : -1,
                            city: elm.City ? elm.City.Name : "",

                            follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,
                            checked: false,
                            companyType: elm.Type == 0 ? 'Có' : 'Không',
                            // stageID: elm.DealStage ? elm.DealStage.ID : -1,
                            // stageName: elm.DealStage ? elm.DealStage.Name : "",

                            lastActivity: mModules.toDatetime(elm.LastActivity),
                            Fax: elm.Fax,
                            properties: elm.Role,
                            CategoryID: elm.CategoryID ? elm.CategoryID : '',
                            CustomerGroup: elm.CategoryCustomer ? elm.CategoryCustomer.Name : '',
                        })
                    });
                    console.log(array);
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: array,
                        all, unassign, assign, follow, assignAll, customer
                    }
                    res.json(result)
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },

    getDetailCompany: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            let company = mCompany(db);
            company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
            company.belongsTo(company, { foreignKey: 'OldCompanyID', sourceKey: 'OldCompanyID', as: 'oldCompany' });
            company.belongsTo(company, { foreignKey: 'NewCompanyID', sourceKey: 'NewCompanyID', as: 'newCompany' });
            // company.belongsTo(mDealStage(db), { foreignKey: 'StageID', sourceKey: 'StageID' });
            company.belongsTo(mCountry(db), { foreignKey: 'CountryID', sourceKey: 'CountryID', as: 'Country' });
            company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
            company.belongsTo(mCategoryCustomer(db), { foreignKey: 'CategoryID', sourceKey: 'CategoryID' });

            company.findOne({
                where: { ID: body.companyID },
                include: [
                    {
                        model: mUserFollow(db),
                        required: false,
                        where: { UserID: body.userID, Type: 1 }
                    },
                    { model: mCity(db), required: false },
                    { model: mCountry(db), required: false, as: 'Country' },
                    { model: mCategoryCustomer(db), required: false },
                    { model: company, required: false, as: 'oldCompany' },
                    { model: company, required: false, as: 'newCompany' },

                ]
            }).then(async data => {
                if (data) {
                    let companyParent = await rmCompanyChild(db).findOne({ where: { ChildID: body.companyID } });
                    let company;
                    if (companyParent) {
                        company = await mCompany(db).findOne({ where: { ID: companyParent.ParentID } })
                    }
                    let listGroup = [];
                    let listGroupID = [];
                    await mCompanyMailList(db).findAll({
                        where: { CompanyID: data['ID'] },
                    }).then(companymaillist => {
                        if (companymaillist.length > 0)
                            companymaillist.forEach(item => {
                                listGroupID.push(item.MailListID);
                            })
                    })
                    if (listGroupID)
                        await mMailList(db).findAll({
                            where: {
                                ID: { [Op.in]: listGroupID },
                            }
                        }).then(maillist => {
                            if (maillist)
                                maillist.forEach(item => {
                                    listGroup.push({
                                        id: Number(item.ID),
                                        name: item.Name,
                                    })
                                })
                        })
                    var items = [];
                    await mCompanyRelationship(db).findAll({
                        where: {
                            CompanyID: data.ID,
                        }
                    }).then(relationship => {
                        relationship.forEach(element => {
                            items.push({
                                relationship: element.RelationshipCompanyID,
                                note: element.Note,
                                companyID: element.CompanyID,
                                relationshipCompanyID: element.RelationshipCompanyID,
                            })
                        })
                    })
                    await mCompanyRelationship(db).findAll({
                        where: {
                            RelationshipCompanyID: data.ID,
                        }
                    }).then(relationship => {
                        relationship.forEach(element => {
                            items.push({
                                relationship: element.CompanyID,
                                note: element.Note,
                                companyID: element.RelationshipCompanyID,
                                relationshipCompanyID: element.CompanyID,
                            })
                        })
                    })
                    console.log(data.Role);
                    var obj = {
                        id: data['ID'],
                        name: data['Name'],
                        shortName: data['ShortName'],
                        address: data['Address'],
                        phone: data['Phone'],
                        email: data['Email'],
                        timeActive: data['TimeActive'],
                        website: data['Website'],
                        cityID: data.City ? data.City.ID : -1,
                        city: data.City ? data.City.Name : "",
                        follow: data.UserFollows[0] ? data.UserFollows[0]['Follow'] : false,
                        Fax: data.Fax,
                        properties: data.Role,
                        CountryID: data.Country ? data.Country.ID : "",
                        Country: data.Country ? data.Country.Name : "",
                        ParentID: company ? company.ID : '',
                        ParentName: company ? company.Name : '',
                        oldName: data['oldCompany'] ? data['oldCompany']['Name'] : '',
                        oldID: data['oldCompany'] ? data['oldCompany']['ID'] : '',
                        newName: data['newCompany'] ? data['newCompany']['Name'] : '',
                        newID: data['newCompany'] ? data['newCompany']['ID'] : '',
                        customerGroup: listGroup,
                        items: items,
                        noteCompany: data['NoteCompany'],
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        obj: obj
                    }
                    res.json(result)
                } else {
                    res.json(Result.NO_DATA_RESULT);
                }

            })

        })
    },

    getListQuickCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {



            var companyChild = mCompanyChild(db);
            var company = mCompany(db);

            companyChild.belongsTo(mCompany(db), { foreignKey: 'ChildID', sourceKey: 'ChildID' });

            var array = [];

            company.findOne({ where: { ID: body.companyID } }).then(data => {
                company.findOne({ where: { ID: data.ParentID } }).then(data1 => {
                    if (data1) {
                        array.push({
                            id: data1.ID,
                            name: data1.Name,
                            address: data1.Address,
                            email: data1.Email,
                            role: 1
                        });
                    }
                })

                companyChild.findAll({
                    where: { ParentID: body.companyID },
                    raw: true,
                    include: [{ model: mCompany(db) }]
                }).then(data => {

                    data.forEach(elm => {
                        array.push({
                            id: elm['Company.ID'],
                            name: elm['Company.Name'],
                            address: elm['Company.Address'],
                            email: elm['Company.Email'],
                            role: 2
                        })
                    });

                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: array
                    }

                    res.json(result);
                }).catch(() => {
                    res.json(Result.SYS_ERROR_RESULT);
                })
            }).catch(() => {
                res.json(Result.SYS_ERROR_RESULT);
            })

        })
    },

    updateCompany: (req, res) => {
        let body = req.body;
        console.log(body);

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let listUpdate = [];
            if (body.relationship || body.relationship === '')
                listUpdate.push({ key: 'Relationship', value: body.relationship });

            if (body.customerGroup || body.customerGroup === '')
                listUpdate.push({ key: 'CustomerGroup', value: body.customerGroup });

            if (body.noteCompany || body.noteCompany === '')
                listUpdate.push({ key: 'NoteCompany', value: body.noteCompany });

            if (body.companyName || body.companyName === '')
                listUpdate.push({ key: 'Name', value: body.companyName });

            if (body.companyShortName || body.companyShortName === '')
                listUpdate.push({ key: 'ShortName', value: body.companyShortName });

            if (body.companyAddress || body.companyAddress === '')
                listUpdate.push({ key: 'Address', value: body.companyAddress });

            if (body.companyPhone || body.companyPhone === '')
                listUpdate.push({ key: 'Phone', value: body.companyPhone.replace(/plus/g, '+') });

            if (body.companyEmail || body.companyEmail === '')
                listUpdate.push({ key: 'Email', value: body.companyEmail });

            if (body.timeActive || body.timeActive === '')
                listUpdate.push({ key: 'TimeActive', value: body.timeActive });

            if (body.companyCity || body.companyCity === '')
                listUpdate.push({ key: 'CityID', value: body.companyCity });

            if (body.CategoryID || body.CategoryID === '') {
                if (body.CategoryID === '')
                    listUpdate.push({ key: 'CategoryID', value: null });
                else
                    listUpdate.push({ key: 'CategoryID', value: body.CategoryID });

            }
            if (body.oldCompanyID || body.oldCompanyID === '') {
                if (body.oldCompanyID === '')
                    listUpdate.push({ key: 'OldCompanyID', value: null });
                else
                    listUpdate.push({ key: 'OldCompanyID', value: body.oldCompanyID });

            }
            if (body.newCompanyID || body.newCompanyID === '') {
                if (body.newCompanyID === '')
                    listUpdate.push({ key: 'NewCompanyID', value: null });
                else
                    listUpdate.push({ key: 'NewCompanyID', value: body.newCompanyID });

            }

            if (body.CountryID || body.CountryID === '') {
                if (body.CountryID === '')
                    listUpdate.push({ key: 'CountryID', value: null });
                else
                    listUpdate.push({ key: 'CountryID', value: body.CountryID });

            }
            if (body.website)
                listUpdate.push({ key: 'Website', value: body.website });

            // if (body.stageID)
            //     listUpdate.push({ key: 'StageID', value: body.stageID });

            if (body.Fax || body.Fax === '')
                listUpdate.push({ key: 'Fax', value: body.Fax.replace(/plus/g, '+') });
            if (body.properties || body.properties === '')
                listUpdate.push({ key: 'Role', value: body.properties });
            var items = JSON.parse(body.items);
            if (items.length > 0) {
                await mCompanyRelationship(db).destroy({
                    where: {
                        [Op.or]: [
                            {
                                CompanyID: body.companyID,
                            },
                            {
                                RelationshipCompanyID: body.companyID,
                            }
                        ]
                    }
                })
                for (let i = 0; i < items.length; i++) {
                    await mCompanyRelationship(db).create({
                        CompanyID: body.companyID,
                        RelationshipCompanyID: items[i].relationship ? items[i].relationship : null,
                        Note: items[i].note ? items[i].note : '',
                    })
                }
            }
            if (body.customerGroup || body.customerGroup === '') {
                var listID = JSON.parse(body.customerGroup);
                await mCompanyMailList(db).destroy({ where: { CompanyID: body.companyID } });
                for (var i = 0; i < listID.length; i++) {
                    await mCompanyMailList(db).create({
                        CompanyID: body.companyID,
                        MailListID: listID[i],
                    })
                }
            }
            if (body.ChildID || body.ChildID === '') {
                if (body.ChildID === '') {
                    await rmCompanyChild(db).update({
                        ParentID: null,
                    }, { where: { ChildID: body.companyID } })
                } else {
                    await rmCompanyChild(db).update({
                        ParentID: body.ChildID,
                    }, { where: { ChildID: body.companyID } })
                }
            }
            let update = {};
            for (let field of listUpdate) {
                update[field.key] = field.value
            }
            mCompany(db).update(update, { where: { ID: body.companyID } }).then(() => {
                res.json(Result.ACTION_SUCCESS)
            }).catch(() => {
                res.json(Result.SYS_ERROR_RESULT);
            })


        })
    },

    searchCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            user.checkUser(body.ip, body.dbName, body.userID).then(role => {

                let where = [{ Name: { [Op.like]: "%" + body.searchKey + "%" } }]
                if (role != Constant.USER_ROLE.MANAGER) {
                    where.push({ UserID: body.userID })
                }

                mCompany(db).findAll({ where: where, limit: 20 }).then(data => {
                    var array = [];

                    data.forEach(elm => {
                        array.push({
                            id: elm['ID'],
                            name: elm['Name'],
                            phone: elm['Phone'],
                        })
                    });

                    mCompanyChild(db).findAll({ raw: true, attributes: ['ChildID'], where: { ParentID: body.companyID } }).then(data1 => {
                        array = array.filter(item => {
                            let index = data1.findIndex(it1 => {
                                return it1.ChildID == item.id;
                            });
                            if (index > -1)
                                return false;
                            else
                                return true;
                        });
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array: array
                        }
                        res.json(result)
                    })
                })
            })
        })
    },

    addCompany: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var company = mCompany(db);
                var check = false;
                var companyObj = await company.findAll({
                    where: { Name: body.name }
                })
                var companyExits = await company.findAll({
                    where: [
                        { Name: body.name },
                        { Address: body.address },
                    ]
                })
                let role = JSON.parse(body.properties)
                let roleString = ''
                for (let i = 0; i < role.length; i++) {
                    roleString += role[i] + ','
                    if (i == (role.length - 1))
                        roleString += role[i]

                }
                let now = moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS');
                if (companyExits.length <= 0) {
                    if (companyObj.length) check = true;
                    company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
                    company.create({
                        UserID: body.userID ? body.userID : null,
                        Name: body.name,
                        ShortName: body.shortName,
                        Phone: body.phone ? body.phone.replace(/plus/g, '+') : '',
                        Email: body.email ? body.email : null,
                        Address: body.address,
                        CityID: body.cityID ? body.cityID : null,
                        TimeCreate: now,
                        Type: 1,
                        CountryID: body.CountryID ? body.CountryID : null,
                        Fax: body.Fax ? body.Fax.replace(/plus/g, '+') : '',
                        Role: roleString,
                        NoteCompany: body.noteCompany ? body.noteCompany : '',
                        OldCompanyID: body.oldCompanyID ? body.oldCompanyID : null,
                    }).then(async data => {
                        if (data) {
                            var items = JSON.parse(body.items);
                            if (body.oldCompanyID) {
                                await mCompany(db).update({
                                    NewCompanyID: data.ID,
                                }, {
                                    where: { ID: body.oldCompanyID }
                                })
                                await mCompanyMailList(db).update({
                                    CompanyID: data.ID
                                }, {
                                    where: {
                                        CompanyID: body.oldCompanyID
                                    }
                                })
                            }
                            if (items.length > 0) {
                                for (let i = 0; i < items.length; i++) {
                                    await mCompanyRelationship(db).create({
                                        CompanyID: data.ID,
                                        RelationshipCompanyID: items[i].relationship ? items[i].relationship : null,
                                        Note: items[i].note ? items[i].not : '',
                                    })
                                }
                            }
                            if (body.customerGroup) {
                                var listID = JSON.parse(body.customerGroup);
                                for (var i = 0; i < listID.length; i++) {
                                    await mCompanyMailList(db).create({
                                        CompanyID: data.ID,
                                        MailListID: listID[i],
                                    })
                                }
                            }

                        }
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: Constant.MESSAGE.ACTION_SUCCESS,
                            exist: check,
                            id: data.ID,
                        }
                        res.json(result);
                    })
                } else {
                    var result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.INVALID_COMPANY,
                    }
                    res.json(result);
                }

            } catch (error) {
                console.log(error);
                var result = {
                    status: Constant.STATUS.FAIL,
                    message: '',
                }
                res.json(result);
            }
        })
    },

    addParentCompanyByID: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mCompany(db).update(
                { ParentID: body.companyAddID },
                { where: { ID: body.companyID } }
            ).then(result => {
                mCompany(db).findOne({ where: { ID: body.companyAddID } }).then(data => {
                    var obj = {
                        id: data.ID,
                        name: data.Name,
                        address: data.Address,
                        email: data.Email,
                        role: Constant.COMPANY_ROLE.PARENT
                    };

                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                        obj: obj
                    }

                    res.json(result);
                })
            })
        })
    },

    addChildCompanyByID: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mCompanyChild(db).create({
                ParentID: body.companyID,
                ChildID: body.companyAddID,
            }).then(() => {
                mCompany(db).findOne({ where: { ID: body.companyAddID } }).then(data => {
                    var obj = {
                        id: data.ID,
                        name: data.Name,
                        address: data.Address,
                        email: data.Email,
                        role: Constant.COMPANY_ROLE.CHILD
                    };

                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                        obj: obj
                    }

                    res.json(result);
                })
            })
        })
    },

    assignCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.companyIDs) {
                let listCompany = JSON.parse(body.companyIDs);
                let listCompanyID = [];
                listCompany.forEach(item => {
                    listCompanyID.push(Number(item + ""));
                })

                mCompany(db).update(
                    { AssignID: body.assignID != -1 ? body.assignID : null },
                    { where: { ID: { [Op.in]: listCompanyID } } }
                ).then(data => {
                    if (data) {
                        if (body.assignID != -1) {
                            mUser(db).findOne({ where: { ID: body.assignID } }).then(user => {
                                var obj = {
                                    id: user.ID,
                                    name: user.Name,
                                };

                                var result = {
                                    status: Constant.STATUS.SUCCESS,
                                    message: Constant.MESSAGE.ACTION_SUCCESS,
                                    obj: obj
                                }

                                res.json(result);
                            });
                        } else {
                            res.json(Result.ACTION_SUCCESS)
                        }
                    }
                })
            }

        })
    },

    followCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mUserFollow(db).findOne({ where: { UserID: body.userID, CompanyID: body.companyID, Type: 1 } }).then(data => {
                if (data) {
                    mUserFollow(db).update(
                        { Follow: Boolean(body.follow) },
                        { where: { UserID: body.userID, CompanyID: body.companyID, Type: 1 } }
                    ).then(() => {
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: Constant.MESSAGE.ACTION_SUCCESS,
                            follow: body.follow
                        }
                        res.json(result)
                    })
                } else {
                    mUserFollow(db).create({
                        UserID: body.userID,
                        CompanyID: body.companyID,
                        Type: 1,
                        Follow: true
                    }).then(() => {
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: Constant.MESSAGE.ACTION_SUCCESS,
                            follow: true
                        }
                        res.json(result)
                    })
                }
            })


        })
    },

    deleteCompany: (req, res) => {
        let body = req.body;
        console.log(body);
        try {
            database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
                if (body.companyIDs) {
                    let listCompany = JSON.parse(body.companyIDs);
                    let listcompanyID = [];
                    listCompany.forEach(item => {
                        listcompanyID.push(Number(item + ""));
                    });
                    await mUser(db).findOne({ where: { ID: body.userID } }).then(async user => {
                        // if (user.Roles == Constant.USER_ROLE.MANAGER) {
                        await mMailResponse(db).destroy({
                            where: {
                                CompanyID: { [Op.in]: listcompanyID }
                            }
                        })
                        await mCompanyMailList(db).destroy({
                            where: {
                                CompanyID: { [Op.in]: listcompanyID },
                            }
                        })
                        await rmCompanyChild(db).destroy(
                            {
                                where: {
                                    [Op.or]: {
                                        ParentID: { [Op.in]: listcompanyID },
                                        ChildID: { [Op.in]: listcompanyID }
                                    }
                                }
                            }
                        );
                        await rmCall(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmEmail(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmMeet(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmNote(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmContact(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmDeal(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await rmUserFlow(db).destroy({
                            where: { CompanyID: { [Op.in]: listcompanyID } }
                        });
                        await mCompanyRelationship(db).destroy({
                            where: {
                                CompanyID: { [Op.in]: listcompanyID }
                            }
                        })
                        await mCompany(db).update({
                            NewCompanyID: null
                        }, {
                            where: { NewCompanyID: { [Op.in]: listcompanyID } }
                        });
                        await mCompany(db).update({
                            OldCompanyID: null
                        }, {
                            where: { OldCompanyID: { [Op.in]: listcompanyID } }
                        });
                        await mCompany(db).destroy({
                            where: { ID: { [Op.in]: listcompanyID } }
                        });

                        res.json(Result.ACTION_SUCCESS);

                        // } else {
                        //     mCompany(db).update({ UserID: null }, { where: { ID: { [Op.in]: listcompanyID } } }).then(() => {
                        //         res.json(Result.ACTION_SUCCESS);
                        //     })
                        // }
                    });
                }

            })
        } catch (error) {
            console.log(error);
            res.json(Result.SYS_ERROR_RESULT)

        }

    },

    deleteContactFromCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            rmContact(db).update(
                { CompanyID: null },
                { where: { ID: body.contactID } }
            ).then(() => {
                res.json(Result.ACTION_SUCCESS)
            })

        })
    },

    deleteCompanyFromCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.role == Constant.COMPANY_ROLE.PARENT) {
                mCompany(db).update(
                    { ParentID: null },
                    { where: { ID: body.companyID } }
                ).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                });
            }
            else if (body.role == Constant.COMPANY_ROLE.CHILD) {
                mCompanyChild(db).destroy({
                    where: { ParentID: body.companyID, ChildID: body.companyIDRemove }
                }).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                })
            }

        })
    },

    deleteDealFromCompany: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            rmDeal(db).destroy({ where: { ID: body.dealID } }).then(() => {
                res.json(Result.ACTION_SUCCESS)
            });

        })
    },

    createCompanyTrailer: (req, res) => {
        let body = req.body;

        database.checkServerInvalid('163.44.192.123', 'LOGISTIC_CRM', '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
            try {
                var companyData = await mCompany(db).findOne({ where: { Name: body.companyName } });
                if (!companyData) {
                    var companyAdd = await mCompany(db).create({
                        Name: body.companyName,
                        Email: body.companyEmail,
                        Address: body.companyAddress,
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                        Type: 0
                    });
                    await mContact(db).create({
                        Name: body.contactName,
                        Phone: body.contactPhone,
                        CompanyID: companyAdd.ID,
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    });

                    res.json(Result.ACTION_SUCCESS)

                } else {
                    let result = {
                        status: Constant.STATUS.FAIL,
                        message: Constant.MESSAGE.INVALID_COMPANY,
                    }
                    res.json(result)
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }).catch(() => {
            res.json(Result.SYS_ERROR_RESULT)
        })

    },

    searchCompanyToAddressbook: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var whereObj = {};
                let arraySearchAnd = [];
                let arraySearchOr = [];
                let arraySearchNot = [];
                let company = mCompany(db);
                company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
                company.belongsTo(mCountry(db), { foreignKey: 'CountryID', sourceKey: 'CountryID', as: 'Country' });


                company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
                company.hasMany(mDeal(db), { foreignKey: 'CompanyID' });

                var data = JSON.parse(body.data)
                let where = [];
                if (data.search) {
                    var city = [];
                    await mCity(db).findAll({
                        where: {
                            [Op.or]: [
                                { Name: { [Op.like]: '%' + data.search + '%' } },
                                { code: { [Op.like]: '%' + data.search + '%' } },
                            ]
                        }
                    }).then(data => {
                        data.forEach(item => {
                            city.push(item.ID);
                        })
                    })
                    var country = [];
                    await mCountry(db).findAll({
                        where: {
                            [Op.or]: [
                                { Name: { [Op.like]: '%' + data.search + '%' } },
                                { code: { [Op.like]: '%' + data.search + '%' } },
                            ]
                        }
                    }).then(data => {
                        data.forEach(item => {
                            country.push(item.ID);
                        })
                    })
                    arraySearchOr.push({ Name: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Email: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Fax: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Role: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Note: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Phone: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Address: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ Relationship: { [Op.like]: '%' + data.search + '%' } })
                    arraySearchOr.push({ CountryID: { [Op.in]: country } })
                    arraySearchOr.push({ CityID: { [Op.in]: city } })
                } else {
                    where = [
                        { ID: { [Op.ne]: null } },
                    ];
                }
                arraySearchOr.push(where)
                if (data.items) {
                    for (var i = 0; i < data.items.length; i++) {
                        if (data.items[i].fields) {
                            let userFind = {};
                            if (data.items[i].fields['name'] === 'Full Name') {
                                userFind['Name'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                                userFind['Email'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                                userFind['Address'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'ShortName') {
                                userFind['ShortName'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Phone') {
                                userFind['Phone'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Website') {
                                userFind['Website'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Source') {
                                userFind['Source'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Note') {
                                userFind['Note'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Customer Group') {
                                var mailList = [];
                                await mMailList(db).findAll({
                                    where: {
                                        [Op.or]: [
                                            { Name: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' } },
                                        ]
                                    }
                                }).then(data => {
                                    data.forEach(item => {
                                        mailList.push(item.ID);
                                    })
                                })
                                let companyList = [];
                                await mCompanyMailList(db).findAll({
                                    where: {
                                        MailListID: { [Op.in]: mailList }
                                    }
                                }).then(data => {
                                    data.forEach(item => {
                                        companyList.push(item.CompanyID);
                                    })
                                })
                                userFind['ID'] = { [Op.in]: companyList }
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
                            if (data.items[i].fields['name'] === 'Properties') {
                                userFind['Role'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Fax') {
                                userFind['Fax'] = { [Op.like]: '%' + data.items[i]['searchFields'] + '%' }
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
                            if (data.items[i].fields['name'] === 'Country') {
                                userFind['CountryID'] = data.items[i]['searchFields']
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
                            if (data.items[i].fields['name'] === 'City') {
                                var city = [];
                                await mCity(db).findAll({
                                    where: {
                                        [Op.or]: [
                                            { Name: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' } },
                                            { code: { [Op.like]: '%' + data.items[i]['searchFields'] + '%' } },
                                        ]
                                    }
                                }).then(data => {
                                    data.forEach(item => {
                                        city.push(item.ID);
                                    })
                                })
                                userFind['CityID'] = { [Op.in]: city }
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
                }
                arraySearchAnd.push({
                    NewCompanyID: null
                })
                if (arraySearchOr.length > 0)
                    whereObj[Op.or] = arraySearchOr
                if (arraySearchAnd.length > 0)
                    whereObj[Op.and] = arraySearchAnd
                if (arraySearchNot.length > 0)
                    whereObj[Op.not] = arraySearchNot
                var page = 1;
                var itemPerPage = 10;
                if (body.page) {
                    page = body.page;
                    if (body.itemPerPage) {
                        itemPerPage = body.itemPerPage;
                    }
                }
                var data = await company.findAll({
                    where: whereObj,
                    include: [
                        { model: mCountry(db), required: false, as: 'Country' },
                        { model: mUser(db), required: false, as: 'CreateUser' },
                        { model: mUser(db), required: false, as: 'AssignUser' },
                        {
                            model: mUserFollow(db),
                            required: body.companyType == 3 ? true : false,
                            where: { UserID: body.userID, Type: 1, Follow: true }
                        },
                        { model: mCity(db), required: false },
                    ],
                    order: [['ID', 'DESC']],
                    offset: Number(itemPerPage) * (Number(page) - 1),
                    limit: Number(itemPerPage)
                });
                var array = [];
                var all = await company.count({ where: whereObj });
                data.forEach(elm => {
                    console.log(elm.Role);
                    array.push({
                        id: elm.ID,
                        name: elm.Name,

                        ownerID: elm.UserID,
                        ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                        assignID: elm.AssignID,
                        assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                        address: elm.Address,
                        phone: elm.Phone,
                        email: elm.Email,
                        website: elm.Website,
                        timeCreate: mModules.toDatetime(elm.TimeCreate),

                        cityID: elm.City ? elm.City.ID : -1,
                        city: elm.City ? elm.City.Name : "",
                        CountryID: elm.Country ? elm.Country.ID : "",
                        Country: elm.Country ? elm.Country.Name : "",

                        follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,
                        checked: false,
                        companyType: elm.Type == 0 ? 'Có' : 'Không',
                        lastActivity: mModules.toDatetime(elm.LastActivity),
                        Fax: elm.Fax,
                        properties: elm.Role,
                    })
                });
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                    all
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT);
            }
        })
    },
    // get_list_history_company
    getListHistoryCompany: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let check = false;
                let companyNewID = body.companyID
                let array = []
                do {
                    let obj = await getDetailCompanyOld(db, companyNewID)
                    array.push(obj)
                    if (obj.oldCompanyID) {
                        companyNewID = obj.id
                        check = true
                    } else {
                        check = false
                    }
                } while (check == true);
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT);
            }
        })
    },
    // create_company_and_contact
    createCompanyAndContact: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                body.data = body.data.replace(/!!@@##/g, '&')
                let data = JSON.parse(body.data)
                for (let i = 0; i < data.length; i++) {
                    let companyObj = await mCompany(db).create({
                        UserID: data[i].UserID ? data[i].UserID : null,
                        Name: data[i]['Name'],
                        // ShortName: data[i].shortName,
                        Phone: data[i].Phone ? data[i].Phone.replace(/plus/g, '+') : '',
                        Email: data[i].Email ? data[i].Email : '',
                        Address: data[i].Address ? data[i].Address : '',
                        CityID: data[i].CityID ? data[i].CityID : null,
                        TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                        Type: 1,
                        CountryID: data[i].CountryID ? data[i].CountryID : null,
                        Fax: data[i]['Fax'] ? data[i]['Fax'].replace(/plus/g, '+') : '',
                        Role: data[i].Role ? data[i].Role : '',
                        Note: data[i].Note ? data[i].Note : '',
                    })
                    for (let c = 0; c < data[i].arrayContact.length; c++) {
                        await mContact(db).create({
                            Email: data[i].arrayContact[c].Email,
                            Name: data[i].arrayContact[c].Email,
                            CompanyID: companyObj.ID,
                        })
                    }
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: 'Thao tác thành công !',
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT);
            }
        })
    },

}