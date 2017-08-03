
var config = require('./../../masters/config');

var requests = require('request');



/*exports.getOperatorList = function (request, response) {

    try {
        console.log(request.body)
        var mobile = request.body.mobile
        console.log(mobile)
        console.log('config',config.operatorList.listUrl)
        var url = config.operatorList.listUrl+mobile
        console.log(url,'URl')

        requests(url, function (error, res, body) {
          //  console.log(response,"Bodyyyyyyy ",body)
            if (!error && res.statusCode == 200) {
               //   console.log("Bodyyyyyyy ",body)

                if(body){

                    response.send(body)
                }
                else {
                    response.send('failure')
                }


                //console.log(result)
            }
            console.log("Bodyyyyyyy ",body)

        })

    }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }
}*/


function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status: 'failure', message: msg}, null, 3));
}
