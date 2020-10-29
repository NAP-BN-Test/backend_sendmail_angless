module.exports = {
    checkEmail: function (email) { //take this list for dropdown
        return new Promise(res => {
            var request = require('request')
            // a69834eab18e99ec484e9410a47bce5b key hết hạn
            var kickbox = require('kickbox').client('live_c4798dd761296623a23ac412e2cb05e5f3b2dcb4ee211e9d3bb5d2643f9c7104').kickbox();

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