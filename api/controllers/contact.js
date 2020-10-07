const Constant = require('../constants/constant');
const Op = require('sequelize').Op;

const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');
var user = require('../controllers/user');

var mCompany = require('../tables/company');
var mContact = require('../tables/contact');
var mUser = require('../tables/user');
var mUserFollow = require('../tables/user-follow');
var mCategoryJobTitle = require('../tables/category-job-tile');

var rmTaskAssciate = require('../tables/task-associate');
var rmEmailAssciate = require('../tables/email-associate');
var rmCallAssciate = require('../tables/call-associate');
var rmNoteAssciate = require('../tables/note-associate');
var rmMeetAssciate = require('../tables/meet-associate');
var rmUserFollow = require('../tables/user-follow');
var rmMeetContact = require('../tables/meet-contact');
var rmDeal = require('../tables/deal');
var mHistoryContact = require('../tables/HistoryContact');

var mModules = require('../constants/modules');
const email = require('../tables/email');

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
function convertStringToListObjectEmail(string) {
    let result = [];
    let resultArray = [];
    if (string) {
        result = string.split(";")
        result.forEach(item => {
            let resultObj = {};
            resultObj.name = item + '(unsubscribe)';
            resultArray.push(resultObj);
        })
    }
    return resultArray;
}

module.exports = {
    getListHistoryContact: (req, res) => {
        let body = req.body;
        let where = []
        if (body.ContactID) {
            where.push({
                ContactID: body.ContactID,
            })
        }
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mHistoryContact(db).findAll({
                include: [{
                    model: mUser(db),
                    as: 'User'
                    // require: true
                },
                {
                    model: mContact(db),
                    as: 'Contact'
                }
                ],
                where,
            }).then(data => {
                var array = [];
                data.forEach(item => {
                    array.push({
                        id: item.ID,
                        UserId: item.UserID,
                        UserName: item.User ? item.User.Name : '',
                        Date: mModules.toDatetime(item.Date),
                        ContactID: item.ContactID,
                        ContactName: item.Contact ? item.Contact.Name : '',
                        Description: item.Description,
                    })
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array
                }
                res.json(result)
            })
        })
    },
    getListContactFromCompanyID: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mUser(db).findOne({ where: { ID: body.userID } }).then(user => {
                if (user) {
                    var contact = mContact(db);

                    contact.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                    contact.belongsTo(mCategoryJobTitle(db), { foreignKey: 'JobTile', sourceKey: 'JobTile', as: 'JobTileID' });
                    contact.hasMany(mUserFollow(db), { foreignKey: 'ContactID' })
                    contact.findAll({
                        include: [
                            { model: mUser(db), required: false, as: 'CreateUser' },
                            { model: mUser(db), required: false, as: 'AssignUser' },
                            { model: mCategoryJobTitle(db), required: false, as: 'JobTileID' },
                            {
                                model: mUserFollow(db),
                                required: body.contactType == 3 ? true : false,
                                where: { UserID: body.userID, Type: 2, Follow: true }
                            },
                            { model: mCompany(db), required: false }
                        ],
                        where: {
                            CompanyID: body.CompanyID,
                        },
                        order: [['ID', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    }).then(data => {
                        var array = [];

                        data.forEach(elm => {
                            array.push({
                                id: elm.ID,
                                name: elm.Name,
                                email: elm.Email,
                                phone: elm.Phone,
                                timeCreate: mModules.toDatetime(elm.TimeCreate),

                                companyID: elm.Company ? elm.Company.ID : null,
                                companyName: elm.Company ? elm.Company.Name : "",

                                ownerID: elm.UserID,
                                ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                                assignID: elm.AssignID,
                                assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                                follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,

                                lastActivity: elm.LastActivity,
                                JobTile: elm.JobTile,
                                JobTileName: elm.JobTileID ? elm.JobTileID.Name : '',
                            })
                        });
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array: array
                        }
                        res.json(result)
                    })
                }
            })
        })

    },
    getListQuickContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mContact(db).findAll({
                where: { CompanyID: body.companyID },

            }).then(data => {
                let array = [];

                data.forEach(elm => {
                    array.push({
                        id: elm.ID,
                        name: elm.Name,
                        jobTile: elm.JobTile,
                        email: elm.Email,
                    })
                })

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array
                }
                res.json(result)
            }).catch(() => {
                res.json(Result.SYS_ERROR_RESULT);
            })


        })
    },

    getListContact: (req, res) => {//take this list for dropdown
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {



            mContact(db).findAll({ where: { CompanyID: body.companyID } }).then(data => {
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

    getListContactFull: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            mUser(db).findOne({ where: { ID: body.userID } }).then(user => {
                if (user) {
                    var contact = mContact(db);

                    contact.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                    contact.belongsTo(mCategoryJobTitle(db), { foreignKey: 'JobTile', sourceKey: 'JobTile', as: 'JobTileID' });
                    contact.hasMany(mUserFollow(db), { foreignKey: 'ContactID' })

                    let whereSearch = [];
                    if (body.searchKey) {
                        whereSearch = [
                            { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Address: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Phone: { [Op.like]: '%' + body.searchKey + '%' } },
                        ];
                    } else {
                        whereSearch = [
                            { Name: { [Op.ne]: '%%' } },
                            { Address: { [Op.like]: '%%' } },
                            { Phone: { [Op.like]: '%%' } },
                        ];
                    }

                    let userFind = [];
                    if (body.userIDFind) {
                        userFind.push({ UserID: body.userIDFind })
                    }
                    if (user['Roles'] == Constant.USER_ROLE.GUEST) {
                        userFind.push({ UserID: body.userID })
                    }

                    let whereAll;
                    let whereAllAssign;
                    let whereAssign;
                    let whereUnAssign;
                    let whereFollow
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
                    }

                    contact.count({
                        where: whereAll
                    }).then(all => {
                        contact.count({
                            where: whereUnAssign,
                        }).then(unassign => {
                            contact.count({
                                where: whereAllAssign
                            }).then(assignAll => {
                                contact.count({
                                    where: whereAssign,
                                }).then(assign => {
                                    contact.count({
                                        include: [
                                            {
                                                model: mUserFollow(db),
                                                where: { UserID: body.userID, Type: 2, Follow: true }
                                            }
                                        ],
                                        where: whereFollow,
                                    }).then(follow => {
                                        let where;
                                        if (body.searchKey) {
                                            if (body.contactType == 2) {//unassign
                                                where = whereUnAssign
                                            } else if (body.contactType == 4) {//assign
                                                where = whereAssign
                                            } else if (body.contactType == 5) {//assign all
                                                where = whereAllAssign
                                            } else { // all
                                                where = whereAll
                                            }
                                        } else {
                                            if (body.contactType == 2) {//unassign
                                                where = whereUnAssign
                                            } else if (body.contactType == 4) {//assign
                                                where = whereAssign
                                            } else {// all
                                                where = whereAll
                                            }
                                        }

                                        contact.findAll({
                                            include: [
                                                { model: mUser(db), required: false, as: 'CreateUser' },
                                                { model: mUser(db), required: false, as: 'AssignUser' },
                                                { model: mCategoryJobTitle(db), required: false, as: 'JobTileID' },
                                                {
                                                    model: mUserFollow(db),
                                                    required: body.contactType == 3 ? true : false,
                                                    where: { UserID: body.userID, Type: 2, Follow: true }
                                                },
                                                { model: mCompany(db), required: false }
                                            ],
                                            where: where,
                                            order: [['ID', 'DESC']],
                                            offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                                            limit: Number(body.itemPerPage)
                                        }).then(data => {
                                            var array = [];

                                            data.forEach(elm => {
                                                array.push({
                                                    id: elm.ID,
                                                    name: elm.Name,
                                                    email: elm.Email,
                                                    phone: elm.Phone,
                                                    timeCreate: mModules.toDatetime(elm.TimeCreate),

                                                    companyID: elm.Company ? elm.Company.ID : null,
                                                    companyName: elm.Company ? elm.Company.Name : "",

                                                    ownerID: elm.UserID,
                                                    ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                                                    assignID: elm.AssignID,
                                                    assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                                                    follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,

                                                    lastActivity: elm.LastActivity,
                                                    JobTile: elm.JobTile,
                                                    JobTileName: elm.JobTileID ? elm.JobTileID.Name : null,
                                                })
                                            });
                                            var result = {
                                                status: Constant.STATUS.SUCCESS,
                                                message: '',
                                                array: array,
                                                all, unassign, assign, follow, assignAll
                                            }
                                            res.json(result)
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
            });


        })
    },

    addContact: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mContact(db).create({
                UserID: body.userID,
                CompanyID: body.companyID ? body.companyID : null,
                Name: body.name,
                Gender: body.gender,
                JobTile: body.jobTile,
                Phone: body.phone,
                Email: body.email,
                Address: body.address,
                Zalo: body.zalo,
                Facebook: body.facebook,
                Skype: body.skype,
                TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
                Note: body.Note,
                Fax: body.Fax,
                Active: body.Active,
                Status: body.Status
            }).then(data => {
                var obj = {
                    id: data.ID,
                    name: data.Name,
                    jobTile: data.JobTile,
                    email: data.Email,
                    handPhone: data.Phone,
                    timeCreate: data.TimeCreate,
                    companyID: "",
                    companyName: "",
                    ownerID: "",
                    ownerName: "",
                };

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj
                }

                res.json(result);
            })

        })
    },

    addContactByID: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mContact(db).update(
                { CompanyID: body.companyID },
                { where: { ID: body.contactID } }
            ).then(() => {
                mContact(db).findOne({ where: { ID: body.contactID } }).then(data => {
                    var obj = {
                        id: data.ID,
                        name: data.Name,
                        jobTile: data.JobTile,
                        email: data.Email,
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

    searchContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            user.checkUser(body.ip, body.dbName, body.userID).then(role => {
                let where = [{ Name: { [Op.like]: "%" + body.searchKey + "%" } }];

                if (role != Constant.USER_ROLE.MANAGER) {
                    where.push({ UserID: body.userID })
                }

                mContact(db).findAll({ where: where, limit: 20 }).then(data => {
                    var array = [];

                    data.forEach(elm => {
                        array.push({
                            id: elm['ID'],
                            name: elm['Name'],
                            phone: elm['Phone'],
                        })
                    });
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: array
                    }
                    res.json(result)
                })
            });

        })
    },

    getDetailContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            let contact = mContact(db);
            contact.hasMany(mUserFollow(db), { foreignKey: 'ContactID' })

            contact.findOne({
                where: { ID: body.contactID },
                include: {
                    model: mUserFollow(db),
                    required: false,
                    where: { UserID: body.userID, Type: 2 }
                }
            }).then(data => {
                var obj = {
                    id: data['ID'],
                    name: data['Name'],
                    address: data['Address'],
                    phone: data['Phone'],
                    email: data['Email'],
                    jobTile: data['JobTile'],
                    follow: data.UserFollows[0] ? data.UserFollows[0]['Follow'] : false
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

    updateContact: (req, res) => {
        let body = req.body;
        let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let listUpdate = [];

            if (body.contactName || body.contactName === '')
                listUpdate.push({ key: 'Name', value: body.contactName });

            if (body.contactAddress || body.contactAddress === '')
                listUpdate.push({ key: 'Address', value: body.contactAddress });

            if (body.contactPhone || body.contactPhone === '')
                listUpdate.push({ key: 'Phone', value: body.contactPhone });

            if (body.contactEmail || body.contactEmail === '')
                listUpdate.push({ key: 'Email', value: body.contactEmail });

            if (body.contactJobTile || body.contactJobTile === '')
                listUpdate.push({ key: 'JobTile', value: body.contactJobTile });

            if (body.Fax || body.Fax === '')
                listUpdate.push({ key: 'Fax', value: body.Fax })

            if (body.Active || body.Active === '')
                listUpdate.push({ key: 'Active', value: body.Active });

            if (body.Note || body.Note === '')
                listUpdate.push({ key: 'Note', value: body.Note })

            if (body.Status || body.Status === '')
                listUpdate.push({ key: 'Status', value: body.Status })


            let update = {};
            for (let field of listUpdate) {
                update[field.key] = field.value
            }
            mContact(db).update(update, { where: { ID: body.contactID } }).then(() => {
                mHistoryContact(db).create({
                    UserID: body.userID,
                    Date: now,
                    ContactID: body.contactID,
                    // Description: item.Description,
                })
                res.json(Result.ACTION_SUCCESS)
            }).catch(() => {
                res.json(Result.SYS_ERROR_RESULT);
            })


        })
    },

    assignContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.contactIDs) {
                let listContact = JSON.parse(body.contactIDs);
                let listContactID = [];
                listContact.forEach(item => {
                    listContactID.push(Number(item + ""));
                })

                mContact(db).update(
                    { AssignID: body.assignID },
                    { where: { ID: { [Op.in]: listContactID } } }
                ).then(data => {
                    if (data) {
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
                    }
                })
            }

        })
    },

    deleteContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            if (body.contactIDs) {
                let listContact = JSON.parse(body.contactIDs);
                let listContactID = [];
                listContact.forEach(item => {
                    listContactID.push(Number(item + ""));
                });

                mUser(db).findOne({ where: { ID: body.userID } }).then(user => {
                    if (user.Roles == Constant.USER_ROLE.MANAGER) {
                        rmCallAssciate(db).update(
                            { ContactID: null },
                            { where: { ContactID: { [Op.in]: listContactID } } }
                        ).then(() => {
                            rmEmailAssciate(db).update(
                                { ContactID: null },
                                { where: { ContactID: { [Op.in]: listContactID } } }
                            ).then(() => {
                                rmMeetAssciate(db).update(
                                    { ContactID: null },
                                    { where: { ContactID: { [Op.in]: listContactID } } }
                                ).then(() => {
                                    rmNoteAssciate(db).update(
                                        { ContactID: null },
                                        { where: { ContactID: { [Op.in]: listContactID } } }
                                    ).then(() => {
                                        rmTaskAssciate(db).update(
                                            { ContactID: null },
                                            { where: { ContactID: { [Op.in]: listContactID } } }
                                        ).then(() => {
                                            rmUserFollow(db).update(
                                                { ContactID: null },
                                                { where: { ContactID: { [Op.in]: listContactID } } }
                                            ).then(() => {
                                                rmDeal(db).update(
                                                    { ContactID: null },
                                                    { where: { ContactID: { [Op.in]: listContactID } } }
                                                ).then(() => {
                                                    rmMeetContact(db).update(
                                                        { ContactID: null },
                                                        { where: { ContactID: { [Op.in]: listContactID } } }
                                                    ).then(() => {
                                                        mContact(db).destroy({ where: { ID: { [Op.in]: listContactID } } }).then(() => {
                                                            res.json(Result.ACTION_SUCCESS);
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    }
                    else {
                        mContact(db).update({ UserID: null }, { where: { ID: { [Op.in]: listContactID } } }).then(() => {
                            res.json(Result.ACTION_SUCCESS);
                        })
                    }
                });
            }

        })
    },

    followContact: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {


            mUserFollow(db).findOne({ where: { UserID: body.userID, ContactID: body.contactID, Type: 2 } }).then(data => {
                if (data) {
                    mUserFollow(db).update(
                        { Follow: Boolean(body.follow) },
                        { where: { UserID: body.userID, ContactID: body.contactID, Type: 2 } }
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
                        ContactID: body.contactID,
                        Type: 2,
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
    getListContactFromAddressBook: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mUser(db).findOne({ where: { ID: body.userID } }).then(async user => {
                if (user) {
                    var contact = mContact(db);

                    contact.belongsTo(mCompany(db), { foreignKey: 'CompanyID', sourceKey: 'CompanyID' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                    contact.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                    contact.belongsTo(mCategoryJobTitle(db), { foreignKey: 'JobTile', sourceKey: 'JobTile', as: 'JobTileID' });
                    contact.hasMany(mUserFollow(db), { foreignKey: 'ContactID' })
                    var count = await contact.count({
                        where: {
                            CompanyID: body.CompanyID,
                        },
                    });
                    contact.findAll({
                        include: [
                            { model: mUser(db), required: false, as: 'CreateUser' },
                            { model: mUser(db), required: false, as: 'AssignUser' },
                            { model: mCategoryJobTitle(db), required: false, as: 'JobTileID' },
                            {
                                model: mUserFollow(db),
                                required: body.contactType == 3 ? true : false,
                                where: { UserID: body.userID, Type: 2, Follow: true }
                            },
                            { model: mCompany(db), required: false }
                        ],
                        where: {
                            CompanyID: body.CompanyID,
                        },
                        order: [['ID', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    }).then(data => {
                        var array = [];
                        data.forEach(elm => {
                            array.push({
                                id: elm.ID,
                                name: elm.Name,
                                email: convertStringToListObjectEmail(elm.Email),
                                phone: convertStringToListObject(elm.Phone),
                                fax: convertStringToListObject(elm.Fax),
                                timeCreate: mModules.toDatetime(elm.TimeCreate),

                                companyID: elm.Company ? elm.Company.ID : null,
                                companyName: elm.Company ? elm.Company.Name : "",

                                ownerID: elm.UserID,
                                ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                                assignID: elm.AssignID,
                                assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                                follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,

                                lastActivity: elm.LastActivity,
                                JobTile: elm.JobTile,
                                JobTileName: elm.JobTileID ? elm.JobTileID.Name : '',
                                Note: elm.Note ? elm.Note : '',
                                Status: elm.Status ? elm.Status : ''
                            })
                        });
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array: array,
                            all: count

                        }
                        res.json(result)
                    })
                }
            })
        })

    }
}