const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var mUser = require('../controllers/user');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var mailcomposer = require('mailcomposer')
var ses = require('aws-sdk/clients/ses')

module.exports = {
    amazonResponse: (req, res) => { //take this list for dropdown
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            let payload = JSON.parse(body);
            // if (payload.Type === 'SubscriptionConfirmation') {
            //   const promise = new Promise((resolve, reject) => {
            //     // const url = payload.SubscribeURL

            //     // request(url, (error, response) => {
            //     //   if (!error && response.statusCode == 200) {
            //     //     console.log('Yess! We have accepted the confirmation from AWS')
            //     //     return resolve()
            //     //   } else {
            //     //     return reject()
            //     //   }
            //     // })
            //   })

            // //   promise.then(() => {
            // //     res.end("ok")
            // //   })
            // }
            if (payload.Type === 'Notification') {
                console.log(payload);

            }
        })
    },

    checkVerifyEmail: async (req, res) => { //take this list for dropdown
        let body = req.body;

        if (body.email) {
            var ses = new AWS.SES();
            var params = {
                Identities: [body.email]
            };
            await ses.getIdentityVerificationAttributes(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    res.json(Result.SYS_ERROR_RESULT);
                } // an error occurred
                else {
                    if (data.VerificationAttributes[body.email]) {
                        res.json(Result.ACTION_SUCCESS);
                    } else
                        res.json(Result.NO_PERMISSION)
                }
            });
        }
        else res.json(Result.NO_PERMISSION);
    },

    verifyEmail: (req, res) => { //take this list for dropdown
        var body = req.body;
        if (body.email) {
            var ses = new AWS.SES();
            var params = {
                EmailAddress: body.email
            };
            ses.verifyEmailIdentity(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                } else {
                    mUser.updateEmailUser(body.ip, body.dbName, body.userID, body.email);

                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: 'Một email đã được gửi đến hòm thư của bạn, vui lòng kiểm tra và xác nhận!'
                    }
                    res.json(result)
                }
            });
        }
    },


    sendEmail: async function (emailSend, emailRecive, subject, body, array) { //take this list for dropdown
        var nodemailer = require('nodemailer');

        var mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSend.EmailSend,
                pass: emailSend.Password,
            }
        });
        let arraySend = []
        for (let i = 0; i < array.length; i++) {
            arraySend.push({
                filename: array[i].name,
                path: array[i].link,
            })
        }
        var mailOptions = {
            from: emailSend.EmailSend,
            to: emailRecive,
            subject: subject,
            html: body,
            attachments: arraySend
        }
        mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.json({
                    status: 0,
                    message: error,
                });
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    },
    sendEmailStruck: async function (emailSend, emailRecive, subject, body, array) { //take this list for dropdown
        var nodemailer = require('nodemailer');

        var mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSend.EmailSend,
                pass: emailSend.Password,
            }
        });
        let arraySend = []
        for (let i = 0; i < array.length; i++) {
            arraySend.push({
                filename: array[i].name,
                path: array[i].link,
            })
        }
        var mailOptions = {
            from: emailSend.EmailSend,
            to: emailRecive,
            subject: subject,
            html: body,
            attachments: arraySend
        }
        mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.json({
                    status: 0,
                    message: error,
                });
            } else {
                res.json({
                    status: 1,
                    message: 'Gửi thành công !',
                });
            }
        });

    },

}