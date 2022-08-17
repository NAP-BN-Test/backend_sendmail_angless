const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');
var mConfigEmailSend = require('../tables/config-mail-send')

var database = require('../db');
var moment = require('moment');

var mUser = require('../tables/user');

module.exports = {
    configMailSend: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            // await mConfigEmailSend(db).update({ EmailSend: body.email }, {
            //     where: {
            //         ID: {
            //             [Op.ne]: null
            //         }
            //     }
            // })
            mUser(db).update({ Email: body.email }, { where: { Name: 'root' } }).then(response => {
                if (response == 1) {
                    res.json(Result.ACTION_SUCCESS);
                } else {
                    res.json(Result.SYS_ERROR_RESULT);
                }
            })
        })
    },
    updateUser: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let update = [];
            try {
                if (body.username || body.username === '')
                    update.push({ key: 'Username', value: body.username });
                if (body.password || body.password === '')
                    update.push({ key: 'Password', value: body.password });
                if (body.name || body.name === '')
                    update.push({ key: 'Name', value: body.name });
                if (body.roles || body.roles === '')
                    update.push({ key: 'Roles', value: body.roles });
                if (body.phone || body.phone === '')
                    update.push({ key: 'Phone', value: body.phone });
                if (body.email || body.email === '')
                    update.push({ key: 'Email', value: body.email });
                if (body.nameAcronym || body.nameAcronym === '')
                    update.push({ key: 'NameAcronym', value: body.nameAcronym });
                database.updateTable(update, mUser(db), body.id).then(response => {
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
    getListUser: (req, res) => { //take this list for dropdown
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (body.all) {
                mUser(db).findAll({ where: { Active: true } }).then(data => {
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
            } else {
                mUser(db).findAll({
                    where: {
                        ID: {
                            [Op.ne]: body.userID
                        }
                    }
                }).then(data => {
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
            }


        })
    },

    checkUser: async function(ip, dbName, userID) {
        var db = await database.checkServerInvalid(ip, dbName, '00a2152372fa8e0e62edbb45dd82831a');
        try {
            var data = await mUser(db).findOne({ where: { ID: userID } })
            return Promise.resolve(data.Roles);
        } catch (error) {
            return Promise.reject(error)
        }
    },

    updateEmailUser: async function(ip, dbName, userID, email) {
        var db = await database.checkServerInvalid(ip, dbName, '00a2152372fa8e0e62edbb45dd82831a');
        try {
            var data = await mUser(db).update({ Email: email }, { where: { ID: userID } })
            return Promise.resolve(data.Roles);
        } catch (error) {
            return Promise.reject(error)
        }
    },

    addUser: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                var role = await mUser(db).findOne({
                    where: { ID: body.userID },
                    attributes: ['Roles']
                });
                if (role) {
                    var result;
                    if (role.Roles == Constant.USER_ROLE.MANAGER) {
                        var userExist = await mUser(db).findOne({
                            where: { Username: body.regUsername }
                        });
                        if (userExist) {
                            if (userExist.Active === true) {
                                result = {
                                    status: Constant.STATUS.FAIL,
                                    message: Constant.MESSAGE.INVALID_USER
                                }
                                res.json(result);
                            } else {
                                await mUser(db).update({
                                    Name: body.regName,
                                    Username: body.regUsername,
                                    NameAcronym: body.NameAcronym,
                                    Password: body.regPassword,
                                    Phone: body.regPhone ? body.regPhone : "",
                                    Email: body.regEmail ? body.regEmail : "",
                                    Roles: body.roles,
                                    Active: true,
                                    TimeCreate: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
                                }, {
                                    where: { ID: userExist.ID }
                                });
                                res.json(Result.ACTION_SUCCESS)
                            }

                        } else {
                            var userCreate = await mUser(db).create({
                                Name: body.regName,
                                Username: body.regUsername,
                                NameAcronym: body.NameAcronym,
                                Password: body.regPassword,
                                Phone: body.regPhone ? body.regPhone : "",
                                Email: body.regEmail ? body.regEmail : "",
                                Roles: body.roles,
                                Active: true,
                                TimeCreate: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
                            });
                            if (userCreate)
                                res.json(Result.ACTION_SUCCESS)
                            else
                                res.json(Result.INVALID_USER)
                        }
                    }
                } else {
                    res.json(Result.NO_PERMISSION);
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        }).catch(() => {
            res.json(Result.SYS_ERROR_RESULT)
        })

    },


    getListUserCategory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let whereSearch = [{
                        Username: {
                            [Op.like]: '%' + body.searchKey + '%'
                        }
                    },
                    {
                        Name: {
                            [Op.like]: '%' + body.searchKey + '%'
                        }
                    },
                    {
                        Phone: {
                            [Op.like]: '%' + body.searchKey + '%'
                        }
                    },
                    {
                        Email: {
                            [Op.like]: '%' + body.searchKey + '%'
                        }
                    },
                ];

                var categoryData = await mUser(db).findAll({
                    where: [{
                            [Op.or]: whereSearch
                        },
                        { Active: true },
                        {
                            Name: {
                                [Op.ne]: 'root'
                            }
                        }
                    ],
                    raw: true,
                    order: [
                        ['Username', 'ASC']
                    ]
                });
                var array = [];
                if (categoryData.length > 0) {
                    categoryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            username: elm.Username,
                            phone: elm.Phone,
                            email: elm.Email,
                            password: elm.Password,
                            roles: elm.Roles == 2 ? 'Quản lý' : 'Nhân viên',
                        })
                    });
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteUser: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                await mUser(db).update({
                    Active: false
                }, {
                    where: {
                        ID: {
                            [Op.in]: listID
                        }
                    }
                })
                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    getNameEmailRoot: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                mUser(db).findOne({ where: { Name: 'root' } }).then(async data => {
                    if (data) {
                        let email = await mConfigEmailSend(db).findOne({
                            where: {
                                EmailSend: data.Email
                            }
                        })
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            email: data.Email,
                            id: email ? email.ID : null,
                        }
                    } else {
                        var result = {
                            status: Constant.STATUS.FAIL,
                            message: "Email không tồn tại !",
                        }
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