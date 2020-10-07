var session = require('express-session')

let app = require('express')();
let server = require('http').createServer(app);
let cors = require('cors');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
var nameMiddle;
async function getDateInt(req, res, next) {
    var datetime = new Date();
    nameMiddle = Date.parse(datetime);
    next();
}
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + nameMiddle + '.jpg');
    }
});
let upload = multer({ storage: storage });
const DIR = 'D:/images_services/ageless_sendmail';
app.post('/api/upload', getDateInt, upload.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });
    } else {
        console.log(nameMiddle);
        return res.send({
            link: 'http://118.27.192.106:1357/ageless_sendmail/photo-' + nameMiddle + '.jpg',
            success: true
        })
    }
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------handle word----------------------------------------------------------------------------------------------------------
var fs = require('fs');
const JSZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
app.get('/api/test', async function (req, res) {
    fs.readFile('D:/images_services/ageless_sendmail/photo-1601448964001.docx', 'binary', function (err, data) {
        var zip = new JSZip(data);
        var doc = new Docxtemplater().loadZip(zip)
        //set the templateVariables
        doc.setData({
            first_name: 'John',
            last_name: 'Doe',
            phone: '0652455478',
            description: 'New Website'
        });
        doc.render()
        var buf = doc.getZip().generate({ type: 'nodebuffer' });
        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        fs.writeFileSync(path.resolve('D:/images_services/ageless_sendmail/', 'output.docx'), buf);
    });
})
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.use(session({
    name: 'user_sid',
    secret: '00a2152372fa8e0e62edbb45dd82831a',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
        maxAge: 3000000,
        sameSite: true,
        secure: true,
        httpOnly: true
    }
}))

app.use(cors())
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.json({ limit: '100mb' }))


let routes = require('./api/router') //importing route
routes(app)

const port = process.env.PORT || 3002

server.listen(port, function () {
    console.log('http://localhost:' + port);
});

