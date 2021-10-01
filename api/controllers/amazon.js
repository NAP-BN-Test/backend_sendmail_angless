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
    sendMail: async (req, res) => {
        let body = req.body;
        var nodemailer = require('nodemailer');

        var mail = nodemailer.createTransport({
            // host: "smtp.office365.com",
            // secureConnection: true,
            // port: 587,
            service: 'gmail',
            auth: {
                user: body.emailSend.EmailSend,
                pass: body.emailSend.Password,
            }
        });
        var mailOptions = {
            from: body.emailSend.EmailSend,
            to: body.emailRecive,
            subject: body.subject,
            html: body.body,
        }
        await mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.json({
                    status: 0,
                    message: error,
                })
            } else {
                res.json({
                    status: 1,
                    message: 'Gửi thành công !',
                })
            }
        });
    },
    // sendMail: async (req, res) => {
    //     let body = req.body;
    //     var nodemailer = require('nodemailer');
    //     console.log(body);
    //     var mail = nodemailer.createTransport({
    //         host: "mail.ageless.vn",
    //         port: 587,
    //         secure: false,
    //         ignoreTLS: true,
    //         auth: {
    //             user: "Test@ageless.vn",
    //             pass: "ageless123@#",
    //         },
    //     });
    //     var mailOptions = {
    //         from: 'test@ageless.vn',
    //         to: 'tung24041998@gmail.com',
    //         subject: "TEST",
    //         html: "DONE",
    //     }
    //     await mail.sendMail(mailOptions, function (error, info) {
    //         if (error) {
    //             console.log(error);
    //             res.json({
    //                 status: 0,
    //                 message: error,
    //             })
    //         } else {
    //             res.json({
    //                 status: 1,
    //                 message: 'Gửi thành công !',
    //             })
    //         }
    //     });
    // },
    sendEmail: async function (emailSend, emailRecive, subject, body, array, req = null) { //take this list for dropdown
        var nodemailer = require('nodemailer');
        var mail;
        if (emailSend.MailServer && emailSend.OMPort) {
            mail = nodemailer.createTransport({
                host: emailSend.MailServer,
                port: emailSend.OMPort ? emailSend.OMPort : null,
                secure: false,
                ignoreTLS: true, // bắt buộc phải có
                auth: {
                    user: emailSend.EmailSend,
                    pass: emailSend.Password,
                }
            });
        } else {
            mail = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailSend.EmailSend,
                    pass: emailSend.Password,
                }
            });
        }
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
        // var params = {
        //     Destination: {
        //         BccAddresses: [], // bcc email
        //         CcAddresses: [], // cc email
        //         ToAddresses: [
        //             emailRecive
        //         ]
        //     },
        //     Message: {
        //         Body: {
        //             Html: {
        //                 Charset: "UTF-8",
        //                 Data: body
        //             }
        //         },
        //         Subject: {
        //             Charset: "UTF-8",
        //             Data: subject
        //         }
        //     },
        //     Source: "tung24041998@gmail.com",
        //     ReplyToAddresses: [],
        // };
        await mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error + '');
                if (req)
                    req.session.cookie.io.sockets.emit("respone-send-mail", error + '')
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },
}