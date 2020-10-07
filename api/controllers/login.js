const Result = require('../constants/result');
const Constant = require('../constants/constant');

var database = require('../db');
var moment = require('moment');

var mUser = require('../tables/user');

module.exports = {

    login: (req, res) => {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var data = await mUser(db).findOne({
                    where: { Username: body.username, Password: body.password }
                })
                var obj = {
                    id: data.ID,
                    name: data.Name,
                    username: data.Username,
                    password: data.Password,
                    phone: data.Phone,
                    email: data.Email,
                    role: data.Roles,
                }
                if (obj) {
                    req.session.userID = data.ID;

                    await mUser(db).update({
                        TimeLogin: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
                    }, {
                        where: { Username: body.username }
                    })
                }

                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj: obj
                }
                res.json(result);
            } catch (error) {
                console.log(error);
                res.json(Result.LOGIN_FAIL)
            }

        }, error => {
            res.json(error)
        })
    },

}