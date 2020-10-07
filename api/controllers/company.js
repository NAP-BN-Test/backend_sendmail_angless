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

var mModules = require('../constants/modules')


module.exports = {
    getListNameCompany: (req, res) => {

        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                user.checkUser(body.ip, body.dbName, body.userID).then(async role => {
                    var data = await mCompany(db).findAll({
                        order: [['ID', 'DESC']],
                        limit: 1000,
                    });
                    var array = [];
                    data.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.ID + ' - ' + elm.Name + ' - ' + elm.Address,
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
                            Role: elm.Role,
                            CategoryID: elm.CategoryID ? elm.CategoryID : '',
                            CustomerGroup: elm.CategoryCustomer ? elm.CategoryCustomer.Name : '',
                        })
                    });

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
                    // {
                    //     model: mDealStage(db),
                    //     required: false,
                    // },
                    { model: mCountry(db), required: false, as: 'Country' },
                    { model: mCategoryCustomer(db), required: false },

                ]
            }).then(async data => {
                let companyParent = await rmCompanyChild(db).findOne({ where: { ChildID: body.companyID } });
                let company;
                if (companyParent) {
                    company = await mCompany(db).findOne({ where: { ID: companyParent.ParentID } })
                }
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
                    // stageID: data.DealStage ? data.DealStage.ID : -1,
                    // stageName: data.DealStage ? data.DealStage.Name : "",
                    Fax: data.Fax,
                    Role: data.Role,
                    CountryID: data.Country ? data.Country.ID : "",
                    Country: data.Country ? data.Country.Name : "",
                    Note: data.Note,
                    ParentID: company ? company.ID : '',
                    ParentName: company ? company.Name : '',
                    relationship: data.Relationship ? data.Relationship : '',
                    customerGroup: data.CustomerGroup ? data.CustomerGroup : '',
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj: obj
                }
                res.json(result)
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
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let listUpdate = [];
            if (body.relationship || body.relationship === '')
                listUpdate.push({ key: 'Relationship', value: body.relationship });

            if (body.customerGroup || body.customerGroup === '')
                listUpdate.push({ key: 'CustomerGroup', value: body.customerGroup });

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

            if (body.Role || body.Role === '')
                listUpdate.push({ key: 'Role', value: body.Role });

            if (body.Note || body.Note === '')
                listUpdate.push({ key: 'Note', value: body.Note });

            if (body.relationship || body.relationship === '')
                listUpdate.push({ key: 'Relationship', value: body.relationship });

            if (body.customerGroup || body.customerGroup === '')
                listUpdate.push({ key: 'CustomerGroup', value: body.customerGroup });

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
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var company = mCompany(db);
                company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
                company.create({
                    UserID: body.userID ? body.userID : null,
                    Name: body.name,
                    ShortName: body.shortName,
                    Phone: body.phone ? body.phone.replace(/plus/g, '+') : '',
                    Email: body.email,
                    Address: body.address,
                    CityID: body.cityID ? body.cityID : null,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                    Type: 1,
                    CountryID: body.CountryID ? body.CountryID : null,
                    Fax: body.Fax ? body.Fax.replace(/plus/g, '+') : '',
                    Role: body.Role ? body.Role : '',
                    Note: body.Note ? body.Note : '',
                    CustomerGroup: body.customerGroup ? body.customerGroup : '',
                    Relationship: body.relationship ? body.relationship : '',
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);
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

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.companyIDs) {
                let listCompany = JSON.parse(body.companyIDs);
                let listcompanyID = [];
                listCompany.forEach(item => {
                    listcompanyID.push(Number(item + ""));
                });

                mUser(db).findOne({ where: { ID: body.userID } }).then(async user => {
                    if (user.Roles == Constant.USER_ROLE.MANAGER) {

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
                        await mCompany(db).destroy({
                            where: { ID: { [Op.in]: listcompanyID } }
                        });

                        res.json(Result.ACTION_SUCCESS);

                    } else {
                        mCompany(db).update({ UserID: null }, { where: { ID: { [Op.in]: listcompanyID } } }).then(() => {
                            res.json(Result.ACTION_SUCCESS);
                        })
                    }
                });
            }

        })
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
            let company = mCompany(db);
            company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
            company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
            company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
            company.belongsTo(mCountry(db), { foreignKey: 'CountryID', sourceKey: 'CountryID', as: 'Country' });
            // company.belongsTo(mDealStage(db), { foreignKey: 'StageID', sourceKey: 'StageID' });

            company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
            company.hasMany(mDeal(db), { foreignKey: 'CompanyID' });

            var data = JSON.parse(body.data)
            let where = [];
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
                data.items.forEach(item => {
                    if (item.fields) {
                        let userFind = {};
                        if (item.fields['name'] === 'Name') {
                            userFind['Name'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Email') {
                            userFind['Email'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Address') {
                            userFind['Address'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'ShortName') {
                            userFind['ShortName'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Phone') {
                            userFind['Phone'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Website') {
                            userFind['Website'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Source') {
                            userFind['Source'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Note') {
                            userFind['Note'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Fax') {
                            userFind['Fax'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                        if (item.fields['name'] === 'Name') {
                            userFind['Name'] = { [Op.like]: '%' + item['searchFields'] + '%' }
                            if (item.conditionFields['name'] == 'And') {
                                whereOjb[Op.and] = userFind
                            }
                            if (item.conditionFields['name'] == 'Or') {
                                whereOjb[Op.or] = userFind
                            }
                            if (item.conditionFields['name'] == 'Not') {
                                whereOjb[Op.not] = userFind
                            }
                        }
                    }
                })
            }
            var data = await company.findAll({
                where: whereOjb,
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
                    // {
                    //     model: mDealStage(db),
                    //     required: false,
                    // }
                ],
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
                    CountryID: elm.Country ? elm.Country.ID : "",
                    Country: elm.Country ? elm.Country.Name : "",

                    follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,
                    checked: false,
                    companyType: elm.Type == 0 ? 'Có' : 'Không',
                    // stageID: elm.DealStage ? elm.DealStage.ID : -1,
                    // stageName: elm.DealStage ? elm.DealStage.Name : "",

                    lastActivity: mModules.toDatetime(elm.LastActivity),
                    Fax: elm.Fax,
                    Role: elm.Role,
                })
            });
            var all = await company.count({ where: whereOjb });
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
                all
            }
            res.json(result)
        })
    },

}