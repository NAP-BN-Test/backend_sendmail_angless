const ftp = require('basic-ftp');
const Duplex = require('stream').Duplex;

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');

var user = require('./user');

var moment = require('moment');

var mCompany = require('../tables/company')
var mContact = require('../tables/contact')
var mCountry = require('../tables/country')

//table



module.exports = {
    importDataTX: async function (req, res) {
        let body = req.body;

        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                var dataArr = JSON.parse(body.dataJson)
                dataArr.forEach(async dataArrItem => {
                    var countryData = await mCountry(db).findOne({
                        where: { Code: dataArrItem.country },
                        raw: true
                    });

                    let timeWorking;
                    let timeActive;
                    if (dataArrItem.timeWorking != '')
                        timeWorking = moment(dataArrItem.timeWorking).format('YYYY-MM-DD HH:mm:ss.SSS');
                    if (dataArrItem.timeWorking != '')
                        timeActive = moment(dataArrItem.timeWorking).format('YYYY-MM-DD HH:mm:ss.SSS');

                    var companyData = await mCompany(db).create({
                        Name: dataArrItem.name,
                        Address: dataArrItem.address,
                        Type: dataArrItem.type == 'Agent' ? dataArrItem.type == 'Company' ? 4 : 3 : 1,
                        CountryID: countryData ? countryData.ID : null,
                        Source: dataArrItem.source,
                        TimeWorking: timeWorking,
                        TimeActive: timeWorking,
                        ScheduleCharge: dataArrItem.charge,
                        Note: dataArrItem.note
                    });

                    if (dataArrItem.listMail.length > 0)
                        dataArrItem.listMail.forEach(async listMailItem => {
                            await mContact(db).create({
                                Name: listMailItem.name,
                                Email: listMailItem.email,
                                CompanyID: companyData.ID
                            })
                        })
                });

                res.json(Result.ACTION_SUCCESS);
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }

        }, error => {
            res.json(error)
        })
    },


}