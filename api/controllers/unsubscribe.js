const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var moment = require('moment');

var mMailResponse = require('../tables/mail-response');
var mMailListDetail = require('../tables/mail-list-detail');


module.exports = {
    unSubscribe: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                if (body.typeSend === 'Maillist') {
                    await mMailResponse(db).create({
                        TimeCreate: now,
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                        TypeSend: body.typeSend,
                        MaillistID: body.campainID,
                        IDGetInfo: body.idGetInfo,
                        Email: body.email,
                        Reason: body.reason,
                    })
                } else {
                    await mMailResponse(db).create({
                        TimeCreate: now,
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE,
                        TypeSend: body.typeSend,
                        MailCampainID: body.campainID,
                        IDGetInfo: body.idGetInfo,
                        Email: body.email,
                        Reason: body.reason,
                    })
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },

}