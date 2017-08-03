/**
 * Created by sabash ls on 01/11/16.
 */
var db = require('./../../model/feedback');
var user = require('./../../model/user');


/*** ==========>  User FeedBack API functions <===========***/

exports.feedback = function(request, response) {

    try {
        var mustparams = ["user_id"];
        if(!checkParams(request, response, mustparams)) return;

        user.findById(request.body.user_id, function (err, doc) {
            if (err || !doc) {
                senderror("User Not found.", response);
                return;
            }
            var data = doc.toJSON();
            if(data['blocked'] == '1'){
                senderror("You are blocked from using the app. Please contact SashCash team for further details", response);
                return;
            }

            var userdata = doc.toJSON();
            var useremail = userdata['email'];
            var usermobile = userdata['mobile'];

            var feedback = new db(request.body);
            feedback.email = useremail;
            feedback.mobile = usermobile;

            //Create Campaign
            db.create(feedback, function (err, doc) {
                if (err) return next(err);
                sendFeedbackDetails(doc, response);
            });
        });

    }
    catch(error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror( "Exception Occurred", response);
    }

}



function sendFeedbackDetails(doc, res)
{
    var docs = JSON.parse(JSON.stringify(doc));
    for (var i = 0; i < docs.length; i++) {
        delete docs[i]['updated_at'];
        delete docs[i]['enddate'];
        delete docs[i]['__v'];
    }

    var data = {};
    data['status'] = "success";
    data['feedbacks'] = docs;
    res.json(data);
}

/*
 * Common Methods
 */
function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ status: 'failure', message : msg }, null, 3));
}


function checkParams(req, res, arr){
    // Make sure each param listed in arr is present in req.query
    var missing_params = [];
    for(var i=0;i<arr.length;i++)
    {
        if(!req.body[arr[i]]){
            missing_params.push(arr[i]);
        }
    }
    if(missing_params.length == 0){
        return true;
    }
    else {
        senderror("Missing Params", res);
        return false;
    }
}