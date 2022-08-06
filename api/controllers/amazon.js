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

    checkVerifyEmail: async(req, res) => { //take this list for dropdown
        let body = req.body;

        if (body.email) {
            var ses = new AWS.SES();
            var params = {
                Identities: [body.email]
            };
            await ses.getIdentityVerificationAttributes(params, function(err, data) {
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
        } else res.json(Result.NO_PERMISSION);
    },

    verifyEmail: (req, res) => { //take this list for dropdown
        var body = req.body;
        if (body.email) {
            var ses = new AWS.SES();
            var params = {
                EmailAddress: body.email
            };
            ses.verifyEmailIdentity(params, function(err, data) {
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
    sendMail: async(req, res) => {
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
        await mail.sendMail(mailOptions, function(error, info) {
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
    sendEmail: async function(emailSend, emailRecive, subject, body, array, req = null) { //take this list for dropdown
        var nodemailer = require('nodemailer');
        var mail;
        if (emailSend.MailServer && emailSend.OMPort) {
            // mail = nodemailer.createTransport({
            //     host: emailSend.MailServer,
            //     // secureConnection: true,
            //     secure: false,
            //     port: emailSend.OMPort ? emailSend.OMPort : null,
            //     // thêm dòng này sẽ gửi dc
            //     tls: {
            //         rejectUnauthorized: false
            //     },
            //     // service: 'gmail',
            //     auth: {
            //         user: emailSend.EmailSend,
            //         pass: emailSend.Password,
            //     }
            // });
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
        // Specify the fields in the email.
        // let mailOptions = {
        //     from: senderAddress,
        //     to: toAddresses,
        //     subject: subject,
        //     // cc: ccAddresses,
        //     // bcc: bccAddresses,
        //     text: body_text,
        //     html: body_html,
        //     // Custom headers for configuration set and message tags.
        //     headers: {
        //         'X-SES-CONFIGURATION-SET': configurationSet,
        //         'X-SES-MESSAGE-TAGS': tag0,
        //         'X-SES-MESSAGE-TAGS': tag1
        //     },
        //     attachments: [
        //         {
        //             path: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-1636517560450.xlsx'
        //         },
        //         {
        //             path: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-1636517560450.xlsx'
        //         },
        //     ],
        // };
        var mailOptions = {
            from: emailSend.EmailSend,
            to: emailRecive,
            subject: subject,
            html: body,
            attachments: arraySend
        }
        mail.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error + '' + '----------------------------');
                if (req)
                    req.session.cookie.io.sockets.emit("respone-send-mail", error + '')
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },
    sendMailTest: async(req, res) => {
        let body = req.body;
        var nodemailer = require('nodemailer');
        // If you're using Amazon SES in a region other than US West (Oregon),
        // replace email-smtp.us-west-2.amazonaws.com with the Amazon SES SMTP
        // endpoint in the appropriate AWS Region.
        const smtpEndpoint = "email-smtp.us-west-2.amazonaws.com";

        // The port to use when connecting to the SMTP server.
        const port = 587;

        // Replace sender@example.com with your "From" address.
        // This address must be verified with Amazon SES.
        const senderAddress = "Mary Major <newsletter@ageless-ip.vn>";

        // Replace recipient@example.com with a "To" address. If your account
        // is still in the sandbox, this address must be verified. To specify
        // multiple addresses, separate each address with a comma.
        var toAddresses = ["tung24041998@gmail.com", "lethao.nap@gmail.com"];

        // CC and BCC addresses. If your account is in the sandbox, these
        // addresses have to be verified. To specify multiple addresses, separate
        // each address with a comma.
        // var ccAddresses = "tung24041998@gmail.com";
        // var bccAddresses = "tung24041998@gmail.com";

        // (Optional) the name of a configuration set to use for this message.
        var configurationSet = "ConfigSet";

        // The subject line of the email
        var subject = "Amazon SES test (Nodemailer)";

        // The email body for recipients with non-HTML email clients.
        var body_text = `Amazon SES Test (Nodemailer)
---------------------------------
This email was sent through the Amazon SES SMTP interface using Nodemailer.
`;

        // The body of the email for recipients whose email clients support HTML content.
        var body_html = `<html>
<head></head>
<body>
  <h1>Amazon SES Test (Nodemailer)</h1>
  <p>This email was sent with <a href='https://aws.amazon.com/ses/'>Amazon SES</a>
        using <a href='https://nodemailer.com'>Nodemailer</a> for Node.js.</p>
</body>
</html>`;

        // The message tags that you want to apply to the email.
        var tag0 = "key0=value0";
        var tag1 = "key1=value1";
        try {
            var transporter = nodemailer.createTransport({
                host: "mail.ageless-ip.vn",
                // secureConnection: true,
                secure: false,
                port: 25,
                // thêm dòng này sẽ gửi dc
                tls: {
                    rejectUnauthorized: false
                },
                // service: 'gmail',
                auth: {
                    user: 'newsletter@ageless-ip.vn',
                    pass: 'nv23@#2k21',
                }
            });
            // Specify the fields in the email.
            let mailOptions = {
                from: senderAddress,
                to: toAddresses,
                subject: subject,
                // cc: ccAddresses,
                // bcc: bccAddresses,
                text: body_text,
                html: body_html,
                // Custom headers for configuration set and message tags.
                // headers: {
                //     'X-SES-CONFIGURATION-SET': configurationSet,
                //     'X-SES-MESSAGE-TAGS': tag0,
                //     'X-SES-MESSAGE-TAGS': tag1
                // },
                attachments: [{
                        path: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-1636517560450.xlsx'
                    },
                    {
                        path: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-1636517560450.xlsx'
                    },
                ],
            };

            // Send the email.
            let info = await transporter.sendMail(mailOptions)

            console.log("Message sent! Message ID: ", info.messageId);
        } catch (error) {
            console.log(error);
        }
    },
}