const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
const Result = require('../constants/result');
var moment = require('moment');
var mConfigEmailSend = require('../tables/config-mail-send')
var database = require('../db');
async function deleteRelationshipConfigMailSend(db, listID) {
    await mConfigEmailSend(db).destroy({
        where: {
            ID: { [Op.in]: listID }
        }
    })
}
module.exports = {
    deleteRelationshipConfigMailSend,
    // add_config_mail_send
    addConfigMailSend: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (db) {
                try {
                    mConfigEmailSend(db).create({
                        EmailSend: body.emailSend ? body.emailSend : '',
                        Password: body.password ? body.password : '',
                        MailServer: body.mailServer ? body.mailServer : '',
                        SMTPPort: body.smtpPort ? body.smtpPort : '',
                        Type: body.type ? body.type : true,
                        OMPort: body.omPort ? body.omPort : '',
                        IMPort: body.imPort ? body.imPort : 'true',
                        SSL: body.sslChecked ? body.sslChecked : false,
                    }).then(data => {
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: Constant.MESSAGE.ACTION_SUCCESS,
                        }
                        res.json(result);
                    })
                } catch (error) {
                    console.log(error);
                    res.json(Result.SYS_ERROR_RESULT)
                }
            } else {
                res.json(Constant.MESSAGE.USER_FAIL)
            }
        })
    },
    // update_config_mail_send
    updateConfigMailSend: (req, res) => {
        let body = req.body;
        console.log(body);
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (db) {
                try {
                    let update = [];
                    if (body.emailSend || body.emailSend === '')
                        update.push({ key: 'EmailSend', value: body.emailSend });
                    if (body.omPort || body.omPort === '')
                        update.push({ key: 'OMPort', value: body.omPort });
                    if (body.imPort || body.imPort === '')
                        update.push({ key: 'IMPort', value: body.imPort });
                    update.push({ key: 'SSL', value: body.sslChecked });
                    if (body.password || body.password === '')
                        update.push({ key: 'Password', value: body.password });
                    if (body.type || body.type === '')
                        update.push({ key: 'Type', value: body.type });
                    if (body.mailServer || body.mailServer === '')
                        update.push({ key: 'MailServer', value: body.mailServer });
                    if (body.smtpPort || body.smtpPort === '')
                        update.push({ key: 'SMTPPort', value: body.smtpPort });
                    database.updateTable(update, mConfigEmailSend(db), body.id).then(response => {
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
            } else {
                res.json(Constant.MESSAGE.USER_FAIL)
            }
        })
    },
    // delete_config_mail_send
    deleteConfigMailSend: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            let body = req.body;
            if (db) {
                try {
                    let listID = JSON.parse(body.listID);
                    await deleteRelationshipConfigMailSend(db, listID);
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                    }
                    res.json(result);
                } catch (error) {
                    console.log(error);
                    res.json(Result.SYS_ERROR_RESULT)
                }
            } else {
                res.json(Constant.MESSAGE.USER_FAIL)
            }
        })
    },
    // get_list_config_mail_send
    getListConfigMailSend: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (db) {
                try {
                    mConfigEmailSend(db).findAll().then(data => {
                        var array = [];
                        data.forEach(element => {
                            var obj = {
                                id: Number(element.ID),
                                emailSend: element.EmailSend ? element.EmailSend : '',
                                password: element.Password ? element.Password : '',
                                mailServer: element.MailServer ? element.MailServer : '',
                                smtpPort: element.SMTPPort ? element.SMTPPort : '',
                                type: element.Type == true ? 'Hoạt động' : 'kKông hoạt động',
                                imPort: element.IMPort ? element.IMPort : '',
                                omPort: element.OMPort ? element.OMPort : '',
                                sslChecked: element.SSL ? element.SSL : false,
                                sslDisplay: element.SSL == true ? 'Secure SSL/TLS Settings' : 'Non-SSL Settings',
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

                } catch (error) {
                    console.log(error);
                    res.json(Result.SYS_ERROR_RESULT)
                }
            } else {
                res.json(Constant.MESSAGE.USER_FAIL)
            }
        })
    },
}