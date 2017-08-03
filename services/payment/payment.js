var paymentDB = require('./../../model/payment');
var rechargeDB = require('./../../model/recharge');
var userDB = require('./../../model/user');

//var advertiserDb = require('./../../model/advertiser');
var config = require('./../../controllers/conf');



exports.status = function(request, response) {

    try {
        console.log(request.body,'Payment Response ====================================>')

        var paymentData = request.body;
        console.log('Payment Response ====================================>')

        userDB.findOne({_id:request.body.udf1},function(err,userData){

            if(err || !userData){

                console.log('User not found')
            }
            else {


                var payment = paymentDB()

                payment.user = userData._id,
                payment.type = request.body.name_on_card
                payment.portal = request.body.name_on_card
                payment.amount =  request.body.amount
                payment.transaction_id = request.body.mihpayid
                payment.txn_id = request.body.txnid
                payment.payment_status = request.body.status
                payment.updated_at = request.body.addedon
                payment.created_at = new Date()
                payment.payment_response = request.body
                payment.message = request.body.error_Message

                console.log(payment,'createDataaaaa Payment ')

                paymentDB.create(payment,function (Error,payData) {

                    if(Error || !payData){

                        console.log('Payment Data not Stored')
                    }
                    else {


                        console.log('Payment Data Stored Successfully')

                    }
                })

            }

        })

    }
    catch(error) {
        senderror("Exception error Occured", response);
        return
    }
}


exports.check = function(request, response) {

    try {

        console.log(request.body)

        var payment = request.body

        if (payment.transaction_id) {

            db.findOne({transaction_id: payment.transaction_id}).populate('campaign').exec(function (err, payData) {

                if (err) {
                    response.send({status: 'failure', message: 'Invalide transcation'})
                }
                else {
                    response.send({status: 'success', payment: payData})
                }

            })
        }

        else {

            response.send({status: 'failure', message: 'Invalide transcation'})

        }
    }
    catch (e){
        senderror("Exception error Occured", response);
        return
    }




}




exports.manual = function(request, response) {

    try {

        console.log(request.body)

        var manuals = new manualdb(request.body);

        manuals['payment_status'] = 'pending'
        if (request.body.payment_type == 'NEFT'){
            manuals['payment_type'] = 'NEFT'
        } else {
            manuals['payment_type'] = 'manual'
        }
        console.log('request.body')
        var transcation = Math.floor((Math.random() * 900000) + 100000);
        console.log('request.body',transcation)
        campaigndb.findOne({_id:manuals.campaign}).populate('advertiser').exec(function(err,campData){
            console.log('request.body')
            if(err || !campData){
                senderror("Campaign not Fount", response);
                return
            }
            else {

                manualdb.find({},function(error,findallData){

                    if(error){

                    } else {
                        var TRN_id = findallData.length + 1;
                        manuals['transaction_id']  = "MP00" + TRN_id;
                        manualdb.create(manuals,function (error,createData) {
                            if(createData){
                                campaigndb.update({_id:manuals.campaign},{$set:{payment_status:manuals.payment_status}},function (errors,updateData) {
                                })
                                console.log('Payment Request Accepted successfully responce',campData,createData)

                                orderEmail.campaingOrderConfirmationMail(campData,createData)

                                response.send({status:'success',message:'Payment Request Accepted successfully'});

                            } else {
                                senderror("manual payment failed", response);
                                return
                            }

                        })
                    }

                })


            }
        })



    }
    catch(error) {
        senderror("Exception error Occured", response);
        return
    }
}

exports.allPayment = function(request, response) {

    try {
        db.find().populate('campaign').sort('-updated_at').exec(function (err, doc) {
            if (err) return next(err);
            console.log(doc,'All E-Payment ')
            var data = {};
            data['status'] = "success";
            data['payments'] = doc;
            response.json(data);

        });
    }
    catch(error) {
        senderror("Exception error Occured", response);
        return
    }

}




function sendPaymentDetails(doc, res)
{
    var docs = JSON.parse(JSON.stringify(doc));
    for (var i = 0; i < docs.length; i++) {
        delete docs[i]['updated_at'];
        delete docs[i]['enddate'];
        delete docs[i]['__v'];
    }

    var data = {};
    data['status'] = "success";
    data['payments'] = docs;
    res.json(data);
}

/*
 * Common Methods
 */
function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log(msg,'Advertiser  Error responce ')
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
