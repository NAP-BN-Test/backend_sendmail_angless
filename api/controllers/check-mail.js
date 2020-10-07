module.exports = {
    checkEmail: function (email) { //take this list for dropdown
        return new Promise(res => {
            var request = require('request')
            var post_options = {
                url: `https://apilayer.net/api/check?access_key=a69834eab18e99ec484e9410a47bce5b&email=${email}`,
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