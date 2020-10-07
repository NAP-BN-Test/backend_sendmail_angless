const Op = require('sequelize').Op;

var moment = require('moment');

const Constant = require('../constants/constant');
const Result = require('../constants/result');

var database = require('../db');
var user = require('../controllers/user');


var mCity = require('../tables/city');

var mActivity = require('../controllers/activity');

var mCompany = require('../tables/company');
var mContact = require('../tables/contact');
var mCompanyChild = require('../tables/company-child');
var mUser = require('../tables/user');
var mUserFollow = require('../tables/user-follow');
var mDeal = require('../tables/deal');
var mDealStage = require('../tables/deal-stage');

var rmCompanyChild = require('../tables/company-child');
var rmCall = require('../tables/call');
var rmEmail = require('../tables/email');
var rmMeet = require('../tables/meet');
var rmNote = require('../tables/note');
var rmContact = require('../tables/contact');
var rmDeal = require('../tables/deal');
var rmUserFlow = require('../tables/user-follow');

var mModules = require('../constants/modules')

var mCountry = require('../tables/country');

module.exports = {
    getListAddressBook: (req, res) => {

        let body = req.body;
        database.checkServerInvalid(body.ip, body.dbName, body.secretKey).then(async db => {
            try {
                user.checkUser(body.ip, body.dbName, body.userID).then(async role => {
                    let company = mCompany(db);
                    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'UserID', as: 'CreateUser' });
                    company.belongsTo(mUser(db), { foreignKey: 'UserID', sourceKey: 'AssignID', as: 'AssignUser' });
                    company.belongsTo(mCity(db), { foreignKey: 'CityID', sourceKey: 'CityID' });
                    company.belongsTo(mCountry(db), { foreignKey: 'CountryID', sourceKey: 'CountryID', as: 'Country' });
                    // company.belongsTo(mDealStage(db), { foreignKey: 'StageID', sourceKey: 'StageID' });

                    company.hasMany(mUserFollow(db), { foreignKey: 'CompanyID' })
                    company.hasMany(mDeal(db), { foreignKey: 'CompanyID' });

                    let whereSearch = [];
                    if (body.searchKey) {
                        whereSearch = [
                            { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Address: { [Op.like]: '%' + body.searchKey + '%' } },
                            { Phone: { [Op.like]: '%' + body.searchKey + '%' } },
                        ];
                    } else {
                        whereSearch = [
                            { Name: { [Op.ne]: '%%' } },
                            { Address: { [Op.like]: '%%' } },
                            { Phone: { [Op.like]: '%%' } },
                        ];
                    }

                    let Find = [];
                    if (body.userIDFind) {
                        Find.push({ UserID: body.userIDFind })
                    }
                    if (body.CityID) {
                        Find.push({ CityID: body.CityID })
                    }
                    if (body.CountryID) {
                        Find.push({ CountryID: body.CountryID })
                    }

                    if (body.Address)
                        Find.push({ Address: { [Op.like]: '%' + body.Address + '%' } })

                    if (body.Email)
                        Find.push({ Email: { [Op.like]: '%' + body.Email + '%' } })

                    if (body.Phone)
                        Find.push({ Phone: { [Op.like]: '%' + body.Phone + '%' } })

                    if (body.Fax)
                        Find.push({ Fax: { [Op.like]: '%' + body.Fax + '%' } })

                    if (body.Role)
                        Find.push({ Role: { [Op.like]: '%' + body.Role + '%' } })
                    let whereAll;
                    whereAll = {
                        [Op.or]: whereSearch,
                        [Op.and]: Find
                    };
                    var data = await company.findAll({
                        where: whereAll,
                        include: [
                            { model: mCountry(db), required: false, as: 'Country' },
                            { model: mUser(db), required: false, as: 'CreateUser' },
                            { model: mUser(db), required: false, as: 'AssignUser' },
                            {
                                model: mUserFollow(db),
                                required: body.companyType == 3 ? true : false,
                                where: { UserID: body.userID, Type: 1, Follow: true }
                            },
                            // { model: mCity(db), required: false },
                            // {
                            //     model: mDealStage(db),
                            //     required: false,
                            // }
                        ],
                        order: [['ID', 'DESC']],
                        offset: Number(body.itemPerPage) * (Number(body.page) - 1),
                        limit: Number(body.itemPerPage)
                    });

                    var array = [];
                    data.forEach(elm => {
                        array.push({
                            id: elm.ID,
                            name: elm.Name,

                            ownerID: elm.UserID,
                            ownerName: elm.CreateUser ? elm.CreateUser.Username : "",

                            assignID: elm.AssignID,
                            assignName: elm.AssignUser ? elm.AssignUser.Username : "",

                            address: elm.Address,
                            phone: elm.Phone,
                            email: elm.Email,
                            website: elm.Website,
                            timeCreate: mModules.toDatetime(elm.TimeCreate),

                            cityID: elm.City ? elm.City.ID : -1,
                            city: elm.City ? elm.City.Name : "",
                            CountryID: elm.Country ? elm.Country.ID : "",
                            Country: elm.Country ? elm.Country.Name : "",

                            follow: elm.UserFollows[0] ? elm.UserFollows[0]['Follow'] : false,
                            checked: false,
                            companyType: elm.Type == 0 ? 'Có' : 'Không',
                            // stageID: elm.DealStage ? elm.DealStage.ID : -1,
                            // stageName: elm.DealStage ? elm.DealStage.Name : "",

                            lastActivity: mModules.toDatetime(elm.LastActivity),
                            Fax: elm.Fax,
                            Role: elm.Role,
                        })
                    });
                    var all = await company.count({ where: whereAll });
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: array, all
                    }
                    res.json(result)
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
}