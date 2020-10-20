const Constant = require('../constants/constant');
const Op = require('sequelize').Op;

const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');
var mGroupCampaign = require('../tables/group-campaign');
var mCampaignGroups = require('../tables/campaign-groups');
var mMailCampaignControler = require('./emai-list');

module.exports = {
    getListGroupCampaign: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mGroupCampaign(db).findAll().then(data => {
                var array = [];
                data.forEach(element => {
                    var obj = {
                        id: Number(element.ID),
                        name: element.Name
                    }
                    array.push(obj);
                });
                var result = {
                    array: array,
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);
            })
        })
    },
    addGroupCampaign: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            mGroupCampaign(db).create({
                Name: body.name,
                Code: body.code,
            }).then(data => {
                var obj = {
                    id: data.ID,
                    name: data.Name
                }
                var result = {
                    obj: obj,
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);
            })
        })
    },
    updateGroupCampaign: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let update = [];
            if (body.name || body.name === '')
                update.push({ key: 'Name', value: body.name });
            if (body.code || body.code === '')
                update.push({ key: 'Code', value: body.code });
            database.updateTable(update, mGroupCampaign(db), body.id).then(data => {
                if (data == 1) {
                    res.json(Result.ACTION_SUCCESS);
                }
            })
        })
    },
    deleteGroupCampaign: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let listID = JSON.parse(body.listID);
                var listIDCampaign = [];
                await mCampaignGroups(db).findAll({
                    where: {
                        IDGroup: {
                            [Op.in]: listID,
                        }
                    }
                }).then(async data => {
                    data.forEach(item => {
                        listIDCampaign.push(item.IDCampaign);
                    })
                })
                await mMailCampaignControler.deleteCampaign(db, listIDCampaign);
                await mGroupCampaign(db).destroy({
                    where: {
                        ID: {
                            [Op.in]: listID,
                        }
                    },
                })
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: Constant.MESSAGE.ACTION_SUCCESS,
                }
                res.json(result);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    }
}