var session = require('express-session')

let app = require('express')();
let server = require('http').createServer(app);
let cors = require('cors');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
var mFileAttach = require('./api/tables/file-attach')


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.json({ limit: '100mb' }))

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,text/plain');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// ------------------------------------------------------------------------------------------------------
var nameMiddle;
async function getDateInt(req, res, next) {
    var datetime = new Date();
    nameMiddle = Date.parse(datetime) + Math.floor(Math.random() * 1000000);
    next();
}
var pathFile;
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        pathFile = path.extname(file.originalname)
        nameFile = file.originalname.split('.')[0]
        cb(null, file.fieldname + '-' + nameMiddle + pathFile);
    }
});
let upload = multer({ storage: storage });
const DIR = 'C:/images_services/ageless_sendmail';

app.post('/api/upload_file', getDateInt, upload.array('photo', 12), function (req, res) {
    if (!req.files) {
        console.log("No file received");
        return res.send({
            success: false
        });
    } else {
        try {
            database.checkServerInvalid('dbdev.namanphu.vn', 'AGELESS_EMAIL_DB', '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
                let idLink = await mFileAttach(db).create({
                    Name: nameFile + pathFile,
                    Link: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-' + nameMiddle + pathFile,
                })
                return res.send({
                    link: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-' + nameMiddle + pathFile,
                    name: nameFile + pathFile,
                    id: idLink.ID,
                    success: true
                })
            })
        } catch (error) {
            console.log(error);
        }
    }
});
app.post('/api/upload_image', getDateInt, upload.array('photo', 12), function (req, res) {

    if (!req.files) {
        console.log("No file received");
        return res.send({
            success: false
        });
    } else {
        return res.send({
            link: 'http://dbdev.namanphu.vn:1357/ageless_sendmail/photo-' + nameMiddle + pathFile,
            name: nameFile + pathFile,
            success: true
        })
    }
});
const rateLimit = require("express-rate-limit");
const someApiLimiter = rateLimit({
    windowMs: 2000,
    max: 1,
});
var emailList = require('./api/controllers/emai-list');
app.get('/crm/open_mail', someApiLimiter, emailList.addMailResponse);

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------handle word----------------------------------------------------------------------------------------------------------
// var fs = require('fs');
// const JSZip = require('pizzip');
// const Docxtemplater = require('docxtemplater');
// app.get('/api/test', async function (req, res) {
//     fs.readFile('C:/images_services/ageless_sendmail/photo-1601448964001.docx', 'binary', function (err, data) {
//         var zip = new JSZip(data);
//         var doc = new Docxtemplater().loadZip(zip)
//         //set the templateVariables
//         doc.setData({
//             first_name: 'John',
//             last_name: 'Doe',
//             phone: '0652455478',
//             description: 'New Website'
//         });
//         doc.render()
//         var buf = doc.getZip().generate({ type: 'nodebuffer' });
//         // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
//         fs.writeFileSync(path.resolve('C:/images_services/ageless_sendmail/', 'output.docx'), buf);
//     });
// })
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var io = require("socket.io")(server, {
    cors: {
        wsEngine: 'eiows',
        origin: ["http://dbdev.namanphu.vn:8692", "http://localhost:4201", "http://dbdev.namanphu.vn:8693", "http://dbdev.namanphu.vn:8689", "http://localhost:4210"],
        methods: ["GET", "POST"],
        credentials: true,
    }
})
app.use(session({
    name: 'user_sid',
    secret: '00a2152372fa8e0e62edbb45dd82831a',
    resave: false,
    saveUninitialized: false,
    cookie: {
        io: io,
        expires: 600000,
        maxAge: 3000000,
        sameSite: true,
        secure: true,
        httpOnly: true
    }
}))
let routes = require('./api/router') //importing route
routes(app)


var socket = require('./api/socket_io/socket');
socket.sockketIO(io)
const port = process.env.PORT || 3002
const Result = require('./api/constants/result');
var database = require('./api/db');
var resetJob = require('./api/controllers/emai-list');

server.listen(port, function () {
    // {"ip":"dbdev.namanphu.vn","dbName":"AGELESS_EMAIL_DB"}, 'localhost', 'AGELESS_EMAIL_DB'
    database.checkServerInvalid('dbdev.namanphu.vn', 'AGELESS_EMAIL_DB', '00a2152372fa8e0e62edbb45dd82831a').then(async db => {
        try {
            resetJob.resetJob(db);
        } catch (error) {
            console.log(error);
            // res.json(Result.SYS_ERROR_RESULT)
        }
    })
    console.log('http://localhost:' + port);
});

