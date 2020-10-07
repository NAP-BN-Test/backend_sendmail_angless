
const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');
var moment = require('moment');

var mHistory = require('../tables/history');


module.exports = {
    getListHistory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                let where;

                let whereSearch = [];
                whereSearch = [
                    { Name: { [Op.like]: '%' + body.searchKey + '%' } }
                ];

                if (body.timeSelect == Constant.TIME_SELECT.ALL_TIME) {
                    where = {
                        [Op.or]: whereSearch,
                        UserID: body.userID
                    }
                } else {
                    let timeFrom;
                    let timeTo = moment().format("YYYY-MM-DD HH:mm:ss") + "+0000";

                    if (body.timeSelect == Constant.TIME_SELECT.TODAY)
                        timeFrom = moment.utc().format("YYYY-MM-DD") + " 00:00:00+0000";
                    else if (body.timeSelect == Constant.TIME_SELECT.LAST_7DAY)
                        timeFrom = moment().add('days', -7).format("YYYY-MM-DD") + " 00:00:00+0000";
                    else if (body.timeSelect == Constant.TIME_SELECT.YESTERDAY) {
                        timeFrom = moment.utc().add('days', -1).format("YYYY-MM-DD") + " 00:00:00+0000"
                        timeTo = moment.utc().add('days', -1).format("YYYY-MM-DD") + " 23:59:59+0000"
                    }
                    where = {
                        [Op.or]: whereSearch,
                        UserID: body.userID,
                        TimeCreate: { [Op.between]: [new Date(timeFrom), new Date(timeTo)] }
                    }
                }

                var historyData = await mHistory(db).findAll({
                    where: where,
                    order: [
                        ['TimeCreate', 'DESC']
                    ]
                });

                var array = [];

                if (historyData.length > 0) {
                    historyData.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            param: elm.Param,
                            name: elm.Name,
                            router: elm.Router,
                            timeCreate: elm.TimeCreate,
                        })
                    });
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

    addHistory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mHistory(db).create({
                    Param: body.param,
                    UserID: body.userID,
                    Name: body.name,
                    Router: body.router,
                    TimeCreate: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },

    deleteHistory: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {

            try {
                await mHistory(db).destroy({
                    where: { ID: body.historyID }
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },


}