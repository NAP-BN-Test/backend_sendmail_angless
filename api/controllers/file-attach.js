const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
const Result = require('../constants/result');
var moment = require('moment');
var mFileAttach = require('../tables/file-attach')
var database = require('../db');
const fs = require('fs');
async function deleteRelationshiptblFileAttach(db, id) {
    await mFileAttach(db).findOne({ where: { ID: id } }).then(data => {
        if (data.Link) {
            var file = data.Link.replace("http://118.27.192.106:1357/ageless_sendmail/", "")
            fs.unlink("D:/images_services/ageless_sendmail/" + file, (err) => {
                if (err) console.log(err);
            });
        }
    })
    await mFileAttach(db).destroy({
        where: {
            ID: id,
        }
    })
}
module.exports = {
    deleteRelationshiptblFileAttach,
    // // delete_tblFileAttach
    deletetblFileFromLink: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (db) {
                try {
                    var file = body.link.replace("http://118.27.192.106:1357/ageless_sendmail/", "")
                    fs.unlink("D:/images_services/ageless_sendmail/" + file, (err) => {
                        if (err) console.log(err);
                    });
                } catch (error) {
                    console.log(error);
                    res.json(Result.SYS_ERROR_RESULT)
                }
            } else {
                res.json(Constant.MESSAGE.USER_FAIL)
            }
        })
    },
    deletetblFileAttach: (req, res) => {
        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            if (db) {
                try {
                    await deleteRelationshiptblFileAttach(db, body.id);
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
}