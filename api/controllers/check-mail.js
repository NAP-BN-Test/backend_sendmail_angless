module.exports = {
    checkEmail: function (email) { //take this list for dropdown
        return new Promise(res => {
            var request = require('request')
            // a69834eab18e99ec484e9410a47bce5b key hết hạn
            var kickbox = require('kickbox').client('live_889b6846d3bfab1c3a8d11eb09ed061af51c2b0cb6ecebd2832a612bca8665ee').kickbox();

            kickbox.verify(email.trim(), function (err, response) {
                // Let's see some results
                if (err) {
                    console.log(err + '');
                    res(false)
                }

                else {
                    if (response.body.result == 'deliverable')
                        res(true)
                    else
                        res(false)
                }
            });
            // var post_options = {
            //     url: `https://apilayer.net/api/check?access_key=1d3e9ab19ac774c6fe13c12bb74c62db&email=${email.trim()}`,
            //     method: 'GET',
            //     json: true
            // };
        })

    },

}