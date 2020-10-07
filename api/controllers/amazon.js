const Op = require('sequelize').Op;
const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var mUser = require('../controllers/user');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

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
                    console.log(data);

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


    sendEmail: async function (emailSend, emailRecive, subject, body) { //take this list for dropdown
        return new Promise(res => {
            var ses = new AWS.SES();
            var params = {
                Destination: {
                    BccAddresses: [], // bcc email
                    CcAddresses: [], // cc email
                    ToAddresses: [
                        emailRecive
                    ]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: body
                        }
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: subject
                    }
                },
                ReplyToAddresses: [],
                Source: emailSend,
            };
            ses.sendEmail(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    res();
                } else {
                    res(1);
                }; // successful response
                /*
                data = {
                 MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
                }
                */
            });
        })
    },

}