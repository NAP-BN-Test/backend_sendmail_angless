const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const app = express();

const DIR = './upload';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(DIR);
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    }
});
let upload = multer({ storage: storage });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/api/upload', upload.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        console.log('file received');
        return res.send({
            success: true
        })
    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log('Node.js server is running on port ' + PORT);
});