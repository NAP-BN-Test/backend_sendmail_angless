const ftp = require('basic-ftp');
const Duplex = require('stream').Duplex;

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var user = require('./user');

var moment = require('moment');

//table


function bufferToStream(buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

async function checkDir(path) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: "163.44.192.123",
            user: "ftpuser",
            password: "123456a$",
            secure: false
        })
        await client.ensureDir(path);
    }
    catch (err) { }
    client.close()
}

async function uploadFile(source, path) {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: "163.44.192.123",
            user: "ftpuser",
            password: "123456a$",
            secure: false
        })

        await client.uploadFrom(source, path);

        client.close()
        return Promise.resolve(1);
    }
    catch (err) {
        client.close()
        return Promise.resolve(0);
    }
}


module.exports = {
    uploadFile: async function (req, res) {
        const formidable = require('formidable')
        const { PassThrough } = require('stream')

        const form = new formidable.IncomingForm()
        const pass = new PassThrough()

        form.onPart = part => {
            if (!part.filename) {
                form.handlePart(part)
                return
            }
            part.on('data', function (buffer) {
                pass.write(buffer)
            })
            part.on('end', function () {
                pass.end()
            })
        }
        form.parse(req, err => {
            if (err) {
                req.minio = { error: err }
                next()
            } else {
                var fileName = moment().valueOf() + ".png";

                uploadFile(pass, 'LogisticCrm/LOGISTIC_CRM/' + fileName).then(data => {
                    if (data == 1) {
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            imageUrl: 'http://163.44.192.123:8552/LOGISTIC_CRM/' + fileName
                        }
                        res.json(result)
                    }
                });
            }
        })
    },


}