
const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var mCity = require('../tables/city');
var mStep = require('../tables/deal-stage');
var mCountry = require('../tables/country');

var mJobTile = require('../tables/category-job-tile');
var mCallOutcome = require('../tables/category-call-outcome');
var mMailOutcome = require('../tables/category-mail-outcome');


module.exports = {
    //===============City
    getListCity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let whereSearch = [];
                if (body.searchKey) {
                    whereSearch = [
                        { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                        { Code: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
                } else {
                    whereSearch = [
                        { Name: { [Op.like]: '%%' } },
                        { Code: { [Op.like]: '%%' } },
                    ];
                }
                var city = mCity(db);
                city.belongsTo(mCountry(db), { foreignKey: 'CountryID' });

                var cityData = await city.findAll({
                    where: { [Op.or]: whereSearch },
                    order: [
                        ['Name', 'ASC']
                    ],
                    include: {
                        model: mCountry(db)
                    },
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var count = await mCity(db).count({
                    where: { [Op.or]: whereSearch }
                });

                var array = [];

                if (cityData.length > 0) {
                    cityData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            code: elm.Code,
                            countryID: elm.CountryID ? Number(elm.CountryID) : -1,
                            countryName: elm.Country.Name ? elm.Country.Name : ""
                        })
                    });
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                    count
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    addCity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mCity(db).create({
                    CountryID: body.countryID,
                    Code: body.code,
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    updateCity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.countryID)
                    update.push({ key: 'CountryID', value: body.countryID });
                if (body.code)
                    update.push({ key: 'Code', value: body.code });
                if (body.name)
                    update.push({ key: 'Name', value: body.name });

                database.updateTable(update, mCity(db), body.cityID).then(response => {
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

    deleteCity: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mCity(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


    //===============Country
    getListCountry: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let whereSearch = [];
                if (body.searchKey) {
                    whereSearch = [
                        { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                        { Code: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
                } else {
                    whereSearch = [
                        { Name: { [Op.like]: '%%' } },
                        { Code: { [Op.like]: '%%' } },
                    ];
                }
                var countryData = await mCountry(db).findAll({
                    where: { [Op.or]: whereSearch },
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var count = await mCountry(db).count({
                    where: { [Op.or]: whereSearch }
                });

                var array = [];

                if (countryData.length > 0) {
                    countryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            code: elm.Code
                        })
                    });
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                    count
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    addCountry: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mCountry(db).create({
                    Code: body.code,
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    updateCountry: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.code || body.code === '')
                    update.push({ key: 'Code', value: body.code });
                if (body.name || body.name === '')
                    update.push({ key: 'Name', value: body.name });

                database.updateTable(update, mCountry(db), body.countryID).then(response => {
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

    deleteCountry: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mCountry(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


    //===============Step
    getListStep: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let whereSearch = [];
                if (body.searchKey) {
                    whereSearch = [
                        { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                        { Process: { [Op.like]: '%' + body.searchKey + '%' } },
                        { Stage: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
                } else {
                    whereSearch = [
                        { Name: { [Op.like]: '%%' } },
                        { Process: { [Op.like]: '%%' } },
                        { Stage: { [Op.like]: '%%' } },
                    ];
                }

                var stepData = await mStep(db).findAll({
                    where: { [Op.or]: whereSearch },
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ],
                    offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                    limit: Number(body.itemPerPage)
                });

                var count = await mStep(db).count({
                    where: { [Op.or]: whereSearch }
                });

                var array = [];

                if (stepData.length > 0) {
                    stepData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            process: elm.Process,
                            stage: elm.Stage,
                        })
                    });
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: array,
                    count
                }
                res.json(result)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    updateStep: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.name)
                    update.push({ key: 'Name', value: body.name });
                if (body.process)
                    update.push({ key: 'Process', value: body.process });
                if (body.stage)
                    update.push({ key: 'Stage', value: body.stage });

                database.updateTable(update, mStep(db), body.stepID).then(response => {
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

    addStep: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mStep(db).create({
                    Process: body.process,
                    Stage: body.stage,
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteStep: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mStep(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


    //get list all country
    getListAllCountry: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                var countryData = await mCountry(db).findAll({
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ]
                });
                var array = [];
                if (countryData.length > 0) {
                    countryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                            code: elm.Code
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


    //===============JobTile
    getListJobTile: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                var categoryData = await mJobTile(db).findAll({
                    where: { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ]
                });
                var array = [];
                if (categoryData.length > 0) {
                    categoryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name
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

    updateJobTile: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.name || body.name === '')
                    update.push({ key: 'Name', value: body.name });

                database.updateTable(update, mJobTile(db), body.categoryID).then(response => {
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

    addJobTile: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mJobTile(db).create({
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteJobTile: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mJobTile(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


    //===============CallOutcome
    getListCallOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                var categoryData = await mCallOutcome(db).findAll({
                    where: { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ]
                });
                var array = [];
                if (categoryData.length > 0) {
                    categoryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name
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

    updateCallOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.name)
                    update.push({ key: 'Name', value: body.name });

                database.updateTable(update, mCallOutcome(db), body.categoryID).then(response => {
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

    addCallOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mCallOutcome(db).create({
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteCallOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mCallOutcome(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


    //===============MailOutcome
    getListMailOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                var categoryData = await mMailOutcome(db).findAll({
                    where: { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                    raw: true,
                    order: [
                        ['Name', 'ASC']
                    ]
                });
                var array = [];
                if (categoryData.length > 0) {
                    categoryData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name
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

    updateMailOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let update = [];
                if (body.name)
                    update.push({ key: 'Name', value: body.name });

                database.updateTable(update, mMailOutcome(db), body.categoryID).then(response => {
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

    addMailOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mMailOutcome(db).create({
                    Name: body.name
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteMailOutcome: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });

                mMailOutcome(db).destroy({ where: { ID: { [Op.in]: listID } } });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

}