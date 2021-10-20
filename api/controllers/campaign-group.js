const Constant = require('../constants/constant');
const Op = require('sequelize').Op;

const Result = require('../constants/result');

var moment = require('moment');

var database = require('../db');
var mGroupCampaign = require('../tables/group-campaign');
var mCampaignGroups = require('../tables/campaign-groups');
var mMailCampain = require('../tables/mail-campain');

var mMailCampaignControler = require('./emai-list');

module.exports = {
    getListCampaignGroups: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(db => {
            mCampaignGroups(db).findAll({ where: { IDGroup: body.idGroup } }).then(data => {
                var array = [];
                data.forEach(element => {
                    var obj = {
                        id: Number(element.ID),
                        name: element.Name,
                        code: element.Code,
                        isDefault: element.IsDefault || false
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
    addCampaignGroups: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                mCampaignGroups(db).create({
                    Name: body.name ? body.name : '',
                    Code: body.code ? body.code : '',
                    IDGroup: body.idGroup ? body.idGroup : null,
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

            } catch (error) {
                console.log(error + '');
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    updateCampaignGroups: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let update = [];
            if (body.name || body.name === '')
                update.push({ key: 'Name', value: body.name });
            if (body.code || body.code === '')
                update.push({ key: 'Code', value: body.code });
            if (body.idGroup || body.idGroup === '') {
                if (body.idGroup === '')
                    update.push({ key: 'IDGroup', value: null });
                else
                    update.push({ key: 'IDGroup', value: body.idGroup });
            }
            database.updateTable(update, mCampaignGroups(db), body.id).then(data => {
                if (data == 1) {
                    res.json(Result.ACTION_SUCCESS);
                }
            })
        })
    },
    deleteCampaignGroups: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let listID = JSON.parse(body.listID);
                var listIDCampaign = [];
                await mMailCampain(db).findAll({
                    where: {
                        IDGroup1: {
                            [Op.in]: listID,
                        }
                    }
                }).then(async data => {
                    data.forEach(item => {
                        listIDCampaign.push(item.ID);
                    })
                })
                if (listIDCampaign.length > 0)
                    await mMailCampaignControler.deleteCampaign(db, listIDCampaign);
                await mCampaignGroups(db).destroy({
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