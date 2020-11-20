module.exports = {
    checkEmail: function (email, db) { //take this list for dropdown
        return new Promise(async res => {
            var request = require('request');
            var mCheckMail = require('../tables/check-email');
            var check = await mCheckMail(db).findOne({
                where: {
                    Email: email,
                }
            })
            if (!check) {
                var post_options = {
                    url: `https://apilayer.net/api/check?access_key=ee84ec216d1ccb2f542da35667f17525&email=${email}`,
                    method: 'GET',
                    json: true
                };

                request.get(post_options, async function (err, result, bodyrq) {
                    if (err) {
                        console.log(err);
                        res(false);
                    }
                    if (bodyrq) {
                        await mCheckMail(db).create({
                            Email: email,
                            Type: bodyrq.smtp_check,
                        })
                        res(bodyrq.smtp_check);
                    }
                });
            } else {
                if (check.type)
                    return true
                else
                    return false
            }
        })
    },

}