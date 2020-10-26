module.exports = {
    checkEmail: function (email) { //take this list for dropdown
        return new Promise(res => {
            var request = require('request')
            // a69834eab18e99ec484e9410a47bce5b key hết hạn
            var post_options = {
                url: `https://apilayer.net/api/check?access_key=1d3e9ab19ac774c6fe13c12bb74c62db&email=${email.trim()}`,
                method: 'GET',
                json: true
            };

            request.get(post_options, function (err, result, bodyrq) {
                if (err) {
                    console.log(err)
                    res(false);
                }
                if (bodyrq) {
                    res(bodyrq.smtp_check);
                }
            });
        })

    },

}