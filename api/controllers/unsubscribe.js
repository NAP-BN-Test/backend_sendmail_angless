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

                var mailListDetailObj = await mMailListDetail(db).findOne({
                    where: { Email: body.email },
                    attributes: ['ID'],
                    raw: true
                });
                if (mailListDetailObj) {
                    await mMailResponse(db).create({
                        MailListDetailID: mailListDetailObj.ID,
                        TimeCreate: now,
                        Reason: body.reason,
                        MailCampainID: body.campainID,
                        Type: Constant.MAIL_RESPONSE_TYPE.UNSUBSCRIBE
                    })

                    res.json(Result.ACTION_SUCCESS)

                } else res.json(Result.NO_DATA_RESULT)
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },

}