const cryptoJS = require('crypto-js');
var moment = require('moment');


var arrCallStatus = [
    { id: 1, name: 'Không trả lời' },
    { id: 2, name: 'Bận' },
    { id: 3, name: 'Nhầm số' },
    { id: 4, name: 'Tin nhắn' },
    { id: 5, name: 'Cúp máy' },
    { id: 6, name: 'Đã kết nối' },
]

var arrTastType = [
    { id: 1, name: 'Cuộc gọi' },
    { id: 2, name: 'Email' },
    { id: 3, name: 'Gặp mặt' }
]

var arrMailStatus = [
    { id: 1, name: 'Đã gửi' },
    { id: 2, name: 'Đã nhận' },
    { id: 3, name: 'Đã trả lời' },
    { id: 4, name: 'Nhầm email' }
]

var dayInWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

module.exports = {
    toDatetimeHour: function (time) {
        if (time) {
            var hour = moment(time).hours();
            return hour + ":00, " + moment(time).format('DD/MM/YYYY');
        }
        else return null
    },

    toHour: function (time) {
        if (time) {
            return moment(time).hours() + ":00";
        }
        else return null
    },

    toDatetimeDay: function (time) {
        if (time) {
            var day = dayInWeek[moment(time).days()];
            return day + ", " + moment(time).format('DD/MM/YYYY');
        }
        else return null
    },

    toDay: function (time) {
        if (time) {
            return dayInWeek[moment(time).days()];
        }
        else return null
    },

    toDatetimeMonth: function (time) {
        if (time) {
            return "Tháng " + moment(time).format('MM/YYYY');
        }
        else return null
    },

    toMonth: function (time) {
        if (time) {
            return "T" + moment(time).format('MM/YYYY');
        }
        else return null
    },

    toDatetime: function (time) {
        if (time)
            return moment(time).format('DD/MM/YYYY HH:mm');
        else return null
    },

    callStatus: function (type) {
        var obj = arrCallStatus.find(item => {
            return item.id == type
        });
        if (obj) {
            return obj.name
        } else return ''
    },

    mailStatus: function (type) {
        var obj = arrMailStatus.find(item => {
            return item.id == type
        });
        if (obj) {
            return obj.name
        } else return ''
    },

    taskType: function (type) {
        var obj = arrTastType.find(item => {
            return item.id == type
        });
        if (obj) {
            return obj.name
        } else return ''
    },

    encryptKey(value) {

        var key = "CRM@NAP#JSC$123";
        key = cryptoJS.MD5(key).toString();
        var keyHex = cryptoJS.enc.Hex.parse(key);

        var options = {
            mode: cryptoJS.mode.ECB,
            padding: cryptoJS.pad.Pkcs7
        };

        var textWordArray = cryptoJS.enc.Utf8.parse(value);
        var encrypted = cryptoJS.TripleDES.encrypt(textWordArray, keyHex, options);
        var base64String = encrypted.toString();

        return base64String;
    },

    decryptKey(value) {

        var key = "CRM@NAP#JSC$123";
        key = cryptoJS.MD5(key).toString();
        var keyHex = cryptoJS.enc.Hex.parse(key);

        var options = {
            mode: cryptoJS.mode.ECB,
            padding: cryptoJS.pad.Pkcs7
        };

        var resultArray = cryptoJS.TripleDES.decrypt({
            ciphertext: cryptoJS.enc.Base64.parse(value)
        }, keyHex, options);

        return resultArray.toString(cryptoJS.enc.Utf8);
    },

    handleWhereClause: async function (listObj) {
        let obj = {};
        for (let field of listObj) {
            obj[field.key] = field.value
        }
        return obj
    },

    arrayToObj(array) {
        let obj = {};
        for (let field of array) {
            obj[field.key] = field.value
        }
        return obj;
    }
}