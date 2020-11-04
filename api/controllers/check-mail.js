module.exports = {
    checkEmail: function (email) { //take this list for dropdown
        return new Promise(res => {
            var request = require('request')
            // a69834eab18e99ec484e9410a47bce5b key hết hạn
            var kickbox = require('kickbox').client('live_543af6ea3add61b372043e8dc8a7ed47b3c2456b88f4d36729576f57a1029c85').kickbox();

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