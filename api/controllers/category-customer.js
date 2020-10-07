const Op = require('sequelize').Op;

var moment = require('moment');

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');
var user = require('../controllers/user');
var mCategoryCustomer = require('../tables/category-customer');

module.exports = {
    getListAll: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let where = {};
                let whereSearch = [];
                if (body.searchKey) {
                    whereSearch = [
                        { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
                } else {
                    whereSearch = [
                        { Name: { [Op.like]: '%' + '' + '%' } },
                    ];
                }
                where = {
                    [Op.or]: whereSearch,
                }
                var itemPerPage = 10000;
                var page = 1;
                if (body.itemPerPage) {
                    itemPerPage = Number(body.itemPerPage);
                    if (body.page)
                        page = Number(body.page);
                }
                await mCategoryCustomer(db).findAll({
                    where: where,
                    order: [['ID', 'DESC']],
                    offset: itemPerPage * (page - 1),
                    limit: itemPerPage
                }).then(data => {
                    let array = [];
                    data.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,
                        })
                    })

                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                        array: array
                    }
                    res.json(result);
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    addCategory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            await mCategoryCustomer(db).create({
                Name: body.Name,
            }).then(data => {
                var obj = {
                    ID: data.ID,
                    Name: data.Name,
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                    obj: obj
                }
                res.json(result);
            })
        })
    },
    deleteCategory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                if (body.listID) {
                    let list = JSON.parse(body.listID);
                    let listID = [];
                    list.forEach(item => {
                        listID.push(Number(item + ""));
                    });
                    await mCategoryCustomer(db).destroy({ where: { ID: { [Op.in]: listID } } });
                    res.json(Result.ACTION_SUCCESS);
                }

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }

        })
    },
    updateCategory: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let listUpdate = [];
                if (body.Name || body.Name === '')
                    listUpdate.push({ key: 'Name', value: body.Name });
                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mCategoryCustomer(db).update(update, { where: { ID: body.ID } }).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                }).catch(() => {
                    res.json(Result.SYS_ERROR_RESULT);
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    }
}