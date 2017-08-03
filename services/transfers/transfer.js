/**
 * Created by sabash ls on 10/11/16.
 */


var db = require('./../../model/transfer');
var accountHistoryDB = require('./../../model/account_history');

var user = require('./../../model/user');
// var Notify = require('./../../masters/notification');
var Notify = require('../../services/notifications/notification');
var config = require('./../../controllers/conf');

// var config = require('./../../masters/config');
var nodemailer = require('nodemailer');

var curl = require('curlrequest');

var transporter = nodemailer.createTransport("SMTP",{

    service: 'gmail',
    debug: true,
    auth: {
        user: 'noreply@sash.cash',
        pass: 'sash@cash123'
    }
});
var Request = require('request');
var checksum = require('./../../scripts/paytm/checksum');
var randomstring = require("randomstring");
/*** =============> Transfer friend API functions <============= ***/

exports.transfer = function (request, response) {

    try {

        console.log('**********************************')
        console.log(request.body)
        console.log('**********************************')

        var mustparams = ["sender_id", "recipient", "amount"];
        // var mustparams = ["user_id", "type", "service", "amount"];
        if (!checkParams(request, response, mustparams)) return;

        var transfer = new db(request.body);
        var criteria = {}

        if(transfer.amount < 10 || transfer.amount > 100){

            senderror("Invalid Amount Minimum 10 and Maximum 100.", response);

        }


        else
        {
            user.findById(request.body.sender_id, function (err, userDoc) {
                if (err || !userDoc) {
                    senderror("User not found. Please enter valid user details.", response);
                    return;
                }
                else {
                    var userdata = userDoc.toJSON()

                    if(userdata.blocked == '1' || userdata.blocked == 1){

                        response.send(JSON.stringify({status: 'failure', message: 'Your account is blocked, Please contact Sash.Cash support team for further details'}));
                        return;

                    }

                    if (userdata.verified == '0' || userdata.verified == 0) {

                        response.send(JSON.stringify({status: 'verify', data:{result:{_id:userdata._id}}}));
                        return;
                    }

                    user.findOne({$or: [{'email': request.body.recipient}, {'mobile': request.body.recipient}]}, function (err, recipientDoc) {
                        if (err || !recipientDoc) {
                            senderror("Recipient not found. Please enter valid Sash.Cash users details", response);
                            return;
                        }
                        else {

                            var data = recipientDoc.toJSON()

                            if(data.blocked == '1' || data.blocked == 1){

                                response.send(JSON.stringify({status: 'failure', message: 'Your recipient account is blocked, Please contact Sash.Cash support team for further details'}));
                                return;

                            }

                            if(data.verified == '0' || data.verified == 0){

                                response.send(JSON.stringify({status: 'failure', message: 'Your recipient account is not verified, Please contact Sash.Cash support team for further details'}));
                                return;
                            }


                            if(userDoc.mobile == recipientDoc.mobile){
                                senderror("Please use another user to Transfer.", response);
                                return;
                            } else {
                                var userData = userDoc.toJSON();
                                var recipientData = recipientDoc.toJSON();


                                if (userData.wallet < 50){
                                    senderror("Your wallet amount should be minimum Rs 50. ", response);
                                    return;

                                }
                                else if (userData.wallet > 500){
                                    senderror("Your wallet amount should be maximum Rs 500. ", response);
                                    return;

                                }

                                else {

                                    if(Math.ceil(userData.wallet) < Math.ceil(transfer.amount)) {
                                        senderror("Insufficient Wallet Amount.", response);
                                        return;
                                    }

                                    var userWallet = Math.ceil(userData.wallet) - Math.ceil(transfer.amount);
                                    var recipientWallet= Math.ceil(recipientData.wallet) + Math.ceil(transfer.amount);

                                    user.findByIdAndUpdate(recipientData._id, {wallet: recipientWallet}, {new: true}, function (errreciepientwallet, recipientwallet) {                           //Inrement Recipient wallet amount

                                        user.findByIdAndUpdate(userData._id, {wallet: userWallet}, {new: true}, function (erruserwallet, userwallet) {               //Decrement user wallet amount
                                            if(erruserwallet || !userwallet){

                                            } else {
                                                db.find().exec(function (error, transfercount) {

                                                    var transfer_id = transfercount.length + 1;
                                                    transfer.transfer_id = "SCT00"+transfer_id;

                                                    transfer.recipient = recipientData._id;
                                                    transfer.recipient_name = recipientData.full_name;
                                                    transfer.recipient_email = recipientData.email;
                                                    transfer.recipient_mobile = recipientData.mobile;
                                                    transfer.recipient_details = recipientData.user_track_details;


                                                    transfer.sender_id = userData._id;
                                                    transfer.sender_name = userData.full_name;
                                                    transfer.sender_email = userData.email;
                                                    transfer.sender_mobile = userData.mobile;
                                                    transfer.sender_details = userData.user_track_details;

                                                    transfer.type = 'sashcash';
                                                    transfer.status = 'success';

                                                    db.create(transfer, function (error, transferData) {
                                                        if (error) {
                                                            senderror("Transfer Failed.", response);
                                                        } else {
                                                            response.setHeader('Content-Type', 'application/json');

                                                            var userName=userData.full_name;

                                                            var amount=transfer.amount;

                                                            var email=userData.email;

                                                            var recipientName=recipientData.full_name;

                                                            var mailContent="debited from your Sash.Cash wallet for transfer to ";

                                                            var subj="Transfer Amount";

                                                            /*transferMail(subj,email,userName,mailContent,amount,recipientName,response);*/



                                                            sendsms(recipientData.mobile, "Your friend " + userData.full_name + " has transferred Rs " + transfer.amount + " to your Sash.Cash wallet. Thank you.", response);

                                                            sendsms(userData.mobile, "Rs " + transfer.amount + " debited from your Sash.Cash wallet for transfer to " + recipientData.full_name + " . Thank you.", response);

                                                            if(userData.device_type == 'web'){

                                                            }else {

                                                                Notify.transferNotify(userData.push_token,recipientData,transfer.amount)
                                                                // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
                                                            }



                                                            /*** ====== user Account history DB created ===== ***/

                                                            var accountHistorySender = new accountHistoryDB();
                                                            accountHistorySender.amount =  Number(transfer.amount);
                                                            accountHistorySender.transfer =  transfer._id;
                                                            accountHistorySender.type = 'transfer';
                                                            accountHistorySender.source = 'sashcash';
                                                            accountHistorySender.user    = transfer.sender_id;
                                                            accountHistorySender.user_details =transfer.sender_details;
                                                            accountHistorySender.status = 0;
                                                            accountHistorySender.is_earned = 0;
                                                            accountHistorySender.updated_at = new Date();
                                                            accountHistorySender.is_type = 'spend'

                                                            accountHistoryDB.create(accountHistorySender,function (err,creditData) {

                                                            })


                                                             var accountHistoryReceiver = new accountHistoryDB();
                                                            accountHistoryReceiver.amount =  Number(transfer.amount);
                                                            accountHistoryReceiver.transfer =  transfer._id;
                                                            accountHistoryReceiver.type = 'transfer';
                                                            accountHistoryReceiver.source = 'sashcash';
                                                            accountHistoryReceiver.user    = transfer.recipient;
                                                            accountHistoryReceiver.user_details =transfer.recipient_details;
                                                            accountHistoryReceiver.status = 1;
                                                            accountHistoryReceiver.is_earned = 1;
                                                            accountHistoryReceiver.updated_at = new Date();
                                                            accountHistoryReceiver.is_type = 'earn'

                                                            accountHistoryDB.create(accountHistoryReceiver,function (err,creditData) {


                                                            })



                                                            var msg = "Successfully transferred Wallet amount Rs " + transfer.amount + " to your friend " + recipientData.full_name;
                                                            response.send({
                                                                status: 'success',
                                                                message: msg,
                                                                data:{result:transfer}
                                                            });

                                                        }

                                                    })
                                                })
                                            }

                                        })

                                    })
                                }
                            }

                        }

                    })

                }

            });
        }

             }
    catch (error) {
        json = {
            error: "Error: " + error.message
        };
        return senderror("Exception Occurred", response);
    }

}


/*** ==========> Transfer History API functions <===========***/

exports.transferHistory = function (request, response) {

    try {

        console.log('accountHistory', request.body)

        var criteria ;

        user.findById(request.body.user_id, function (err, doc) {

            if (err || !doc) {

                senderror("User Not found.", response);
                     return;
                         }
                         else {


                var data = doc.toJSON()

                if(data.blocked == '1' || data.blocked == 1){

                    response.send(JSON.stringify({status: 'failure', message: 'Your account is blocked, Please contact Sash.Cash support team for further details'}));
                    return;

                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({status: 'verify', data:{result:{_id:data._id}}}));
                    return;
                }

                        if (request.body.select_date) {

                             var date = new Date(request.body.select_date);
                             date.setHours(0, 0, 0, 0);
                             var endDate = new Date(date);
                             endDate.setHours(23, 59, 59, 59);
                             //criteria['sender_id'] = request.body.user_id
                           //  criteria['updated_at'] = {$gte: date, $lt: endDate}
                             criteria ={$or: [{sender_id:request.body.user_id}, {'recipient': request.body.user_id}],updated_at:{$gte: date, $lt: endDate}}

                           }
                           else {

                            criteria ={$or: [{sender_id:request.body.user_id}, {'recipient': request.body.user_id}]}

                      }
                db.find(criteria).populate('users').sort({ updated_at: 1 }).exec(function (err, doc) {

                    if (err) {

                        senderror("No transfer found.", response);

                    } else {

                        sendTransferDetails(doc, response);
                    }
                });
            }
        });

    } catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }
}




/*** ==========> Transfer TO Paytm functions(18-04-2017) <===========***/

exports.transferPaytm = function (request, response) {

    console.log('transferPaytm', request.body)

    var reqData = {mobile:request.body.mobile,
    amount:request.body.amount}

    try {
     var mobile = request.body.mobile;
     var amount = request.body.amount;

        var currentWallet;

        var updateWallet ;

        console.log('transferPaytm', request.body)


        if (request.body.amount < '10' || request.body.amount < 10) {

            senderror("Minimum transfer amount is ₹10", response);
            return;

        }

        if (request.body.amount > '100' || request.body.amount > 100) {

            senderror("Maximum transfer amount is ₹100", response);
            return;
        }
        console.log('request',request.body.amount )

        if ((request.body.amount >= '10' || request.body.amount >= 10) && (request.body.amount <= '100' || request.body.amount <= 100)) {
            console.log('10 to 100')
            user.findOne({_id:request.body.user_id}, function (err, doc) {

                if (err || !doc) {
                    console.log('invalide user')
                    senderror("User Not found.", response);
                    return;
                }
                else {
                    console.log('valid user')

                    var data = doc;
                    currentWallet = data.wallet;
                    if (data.blocked == '1' || data.blocked == 1) {

                        response.send(JSON.stringify({
                            status: 'failure',
                            message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                        }));
                        return;

                    }

                    if (data.verified == '0' || data.verified == 0) {

                        response.send(JSON.stringify({status: 'verify', data: {result: {_id: data._id}}}));
                        return;
                    }

                    //Paytm oriented task has been start here

                   

                    request.body = JSON.stringify(request.body);

                    var Paytm = new Array();

                    var order_id =  randomstring.generate({
                        length: 8,
                        charset: 'alphanumeric',
                    })

                    Paytm =
                        {
                            "request": {
                                "requestType": null,
                                "merchantGuid": 'cefaf68a-217b-448a-8538-d1bbd73beb5f',
                                "merchantOrderId":order_id,
                                "salesWalletName": null,
                                "salesWalletGuid": 'fc132872-3516-4703-8042-c1646410b343',
                                "payeeEmailId": '',
                                "payeePhoneNumber":mobile,
                                "payeeSsoId": "",
                                "appliedToNewUsers": "N",
                                "amount": amount,
                                "currencyCode": "INR"
                            },
                            "metadata": "Testing Data",
                            "ipAddress": "127.0.0.1",
                            "platformName": config.paytm.platformName,
                            "operationType": "SALES_TO_USER_CREDIT"
                        }


                    var finalstring = JSON.stringify(Paytm);

                    

                    checksum.genchecksumbystring(finalstring,'g#7ilvF37IPYWt#x', function (err, results) {
                        console.log(123)
                        Request({
                            url: 'https://trust.paytm.in/wallet-web/salesToUserCredit',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'mid': 'cefaf68a-217b-448a-8538-d1bbd73beb5f',
                                'checksumhash': results
                            },
                            body: finalstring
                        }, function (error, res, resultData) {
                            if (error) {
                                console.log(error);
                            } else {
                                  console.log(res.statusCode, resultData);
                                var result = JSON.parse(resultData)

                                console.log(result.status)
                                if (result.status == 'SUCCESS') {

                                    console.log('successs')
                                    result.status == 'success'

                                    updateWallet = Number(currentWallet)  - Number(amount)

                                    user.update({_id:request.body.user_id},{$set:{wallet:Number(updateWallet)}},function (upErr,upWallet) {

                                        if(upErr){
                                            console.log('Update Failed')
                                        }
                                        else {
                                            console.log('Update Successfully')
                                        }


                                    })
                                    paytmTransfer(reqData,data,order_id,result,response)
                                    


                                }
                                else if (result.status == 'FAILURE') {
                                    console.log(result.response,'failure')
                                    db.find().exec(function (error, transfercount) {
                                        var transfer_id = transfercount.length + 1;
                                        result.response.walletSysTransactionId = "SCT00" + transfer_id;
                                        result.status == 'failure'
                                        paytmTransfer(reqData,data,order_id,result,response)
                                    })

                                }
                                else {
                                    console.log('Pending')
                                    result.status == 'pending'
                                    paytmTransfer(reqData,data,order_id,result,response)
                                }
                            }
                        });
                    });


                }
            });

        }
        else {
          
            senderror("Transfer amount limit is exceeded", response);
            return;

        }


    }
    catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }
}




function paytmTransfer(payData,userData,order_id,paytmData,response) {

    var transfer = new db();
    
    user.findOne({mobile:payData.mobile},function(errs,recipientData){

        if(errs || !recipientData){
            transfer.type = config.paytm.platformName;
            transfer.order_id = order_id;
            transfer.recipient_mobile = payData.mobile;
            transfer.amount = Number(payData.amount)
            transfer.message = paytmData.statusMessage
            transfer.status = paytmData.status;
            transfer.response = paytmData.paytmData
            transfer.transfer_id = paytmData.response.walletSysTransactionId;
            transfer.sender_id = payData.body.user_id;
            transfer.sender_name = userData.full_name;
            transfer.sender_email = userData.email;
            transfer.sender_mobile = userData.mobile;
            transfer.sender_details = userData.user_track_details;

            db.create(transfer, function (error, transferData) {
                if (error) {
                    senderror("Transfer Failed.", response);
                } else {
                    response.setHeader('Content-Type', 'application/json');

                    var userName=userData.full_name;

                    var amount=transfer.amount;

                    sendsms(payData.mobile, "Your friend " + userData.full_name + " has transferred Rs " + transfer.amount + " to your Paytm wallet. Thank you.", response);

                    sendsms(userData.mobile, "Rs " + transfer.amount + " debited from your Sash.Cash wallet for transfer to " + recipientData.full_name + " . Thank you.", response);

                    /*if(userData.device_type == 'web'){

                     }else {

                     Notify.transferNotify(userData.push_token,recipientData,transfer.amount)
                     // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
                     }*/



                    /*** ====== user Account history DB created ===== ***/

                    var accountHistorySender = new accountHistoryDB();
                    accountHistorySender.amount =  Number(transfer.amount);
                    accountHistorySender.transfer =  transfer._id;
                    accountHistorySender.type = 'transfer';
                    accountHistorySender.source = 'Paytm';
                    accountHistorySender.user    = userData._id;
                    accountHistorySender.user_details =userData.user_track_details;
                    accountHistorySender.status = 0;
                    accountHistorySender.is_earned = 0;
                    accountHistorySender.updated_at = new Date();
                    accountHistorySender.is_type = 'spend'

                    accountHistoryDB.create(accountHistorySender,function (err,creditData) {

                    })

                    var msg = "Successfully transferred Wallet amount Rs " + transfer.amount + " to your friend " + recipientData.full_name;
                    response.send({
                        status: 'success',
                        message: msg,
                        data:{result:userWallet}
                    });

                }

            })

        }
        else {

            console.log(recipientData,'recipientData')

            
            transfer.type = config.paytm.platformName;
            transfer.order_id = order_id;
            transfer.recipient = recipientData._id;
            transfer.recipient_name = recipientData.full_name;
            transfer.recipient_email = recipientData.email;
            transfer.recipient_mobile = recipientData.mobile;
            transfer.recipient_details = recipientData.user_track_details;
            transfer.amount = Number(payData.amount)
            transfer.message = paytmData.statusMessage
            transfer.status = paytmData.status;
            transfer.responce = paytmData.paytmData
            transfer.transfer_id = paytmData.response.walletSysTransactionId;
            transfer.sender_id = payData.user_id;
            transfer.sender_name = userData.full_name;
            transfer.sender_email = userData.email;
            transfer.sender_mobile = userData.mobile;
            transfer.sender_details = userData.user_track_details;

            db.create(transfer, function (error, transferData) {
                if (error) {
                    senderror("Transfer Failed.", response);
                } else {
                    response.setHeader('Content-Type', 'application/json');

                    var userName=userData.full_name;

                    var amount=transfer.amount;

                    sendsms(payData.mobile, "Your friend " + userData.full_name + " has transferred Rs " + transfer.amount + " to your Paytm wallet. Thank you.", response);

                    sendsms(userData.mobile, "Rs " + transfer.amount + " debited from your Sash.Cash wallet for transfer to " + recipientData.full_name + " . Thank you.", response);

                    /*if(userData.device_type == 'web'){

                     }else {

                     Notify.transferNotify(userData.push_token,recipientData,transfer.amount)
                     // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
                     }*/



                    /*** ====== user Account history DB created ===== ***/

                    var accountHistorySender = new accountHistoryDB();
                    accountHistorySender.amount =  Number(transfer.amount);
                    accountHistorySender.transfer =  transfer._id;
                    accountHistorySender.type = 'transfer';
                    accountHistorySender.source = 'Paytm';
                    accountHistorySender.user    = userData._id;
                    accountHistorySender.user_details =userData.user_track_details;
                    accountHistorySender.status = 0;
                    accountHistorySender.is_earned = 0;
                    accountHistorySender.updated_at = new Date();
                    accountHistorySender.is_type = 'spend'

                    accountHistoryDB.create(accountHistorySender,function (err,creditData) {

                    })

                    var msg = "Successfully transferred Wallet amount Rs " + transfer.amount + " to your friend " + recipientData.full_name;
                    response.send({
                        status: 'success',
                        message: msg,
                        data:{result:transfer}
                    });

                }

            })
        }

    })

}



/*
 * Common Methods
 */

var transporter = nodemailer.createTransport("SMTP",{

    service: 'gmail',
    debug: true,
    auth: {
        user: 'noreply@sash.cash',
        pass: 'sash@cash123'
    }
});

function transferMail(subj,email,userName,mailContent,amount,recipientName,res){

    var mailOptions = {

        from: 'info@sash.cash',
        to: email,
        subject:subj,
        html:'<!DOCTYPE html><html lang=en><meta charset=UTF-8><title>Welcome Page</title><body style=font-family:sans-serif><div style=width:100%;height:100%;background:#eee><div style=background:#d34d58;height:58px;padding:15px><div style=max-width:600px;margin:auto class=mail_container><div style=display:inline-block;vertical-align:top;width:400px><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/logo_12.png></div><div style=display:inline-block;vertical-align:top;width:175px;text-align:right;float:right><div style=font-size:14px;color:#999>Follow Us</div><div style=margin-top:10px><span style=margin-right:10px><a href=https://www.facebook.com/sashdigitaladvertisement/ target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_fb_light.png></a></span><span style=margin-right:10px><a href=https://www.linkedin.com/company/12180998 target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_insta_light.png></a></span><span><a href=https://twitter.com/sashdigitalads target=_blank><img src=https://s3-ap-southeast-1.amazonaws.com/sashcashimages/email-template/img_twit_light.png></a></span></div></div></div></div><div style=background:#fff;min-width:600px;max-width:600px;margin:auto><div style=padding:15px><div style=margin-top:10px><div style=margin-top:50px;text-align:center;font-size:30px;font-weight:600;color:#333></div><div style=width:94%;margin-left:auto;margin-right:auto;font-size:14px;color:#666;line-height:1.6><p>Dear'+" "+ userName+' <b>,</b><p style=text-indent:50px;text-align:justify>' +"Rs"+" " + amount +" "+ mailContent +" "+ recipientName +"."+ " "+"Thank You"+'</div></div></div><div style=width:600px;margin-left:auto;margin-right:auto;background:#f6f6f6;font-size:11px;color:#b0b0b0;height:auto;padding-bottom:20px;text-align:center><div style=padding:15px><div style=color:#666;font-size:13px><p style=text-align:center;font-size:13px>For any questions please, mail us at <b>support@sash.cash</b> or call us <b>044 - 2226 4333</b></div><div style=color:#666;margin-bottom:5px><b>Disclaimer</b></div><div style=margin-top:2px>Please do not share your sash.cash Wallet password, Credit/Debit card PIN, CVV and any other confidential</div><div style=margin-top:2px>information with anyone even if he/she claims to be from sash.cash. We advice our customers to completely</div><div style=margin-top:2px>ignore such communications.</div></div><div><div style=margin-left:auto;margin-right:auto;font-size:11px;text-align:center><span><a href=""style=color:#b0b0b0;text-decoration:none>Support</a></span>  |   <span><a href=""style=color:#b0b0b0;text-decoration:none>Help Center</a></span>  |   <span><a href=""style=color:#b0b0b0;text-decoration:none>Privacy</a></span>  |   <span><a href=""style=color:#b0b0b0;text-decoration:none>Terms & Conditions</a></span>  |   <span><a href=""style=color:#b0b0b0;text-decoration:none>Unsubscribe</a></span></div><hr style="width:80%;margin-top:15px;border-top:1px solid #ddd;border-bottom:0"></div><div><div style=margin-top:15px;margin-left:auto;margin-right:auto;text-align:center><div>Sash Digital Advertisement Pvt Ltd.</div><div>No.1,Indira Tower, GST Road,Irumbuliyr Bus Stop,</div><div>West Tambaram, Chennai - 600045</div></div></div></div></div></div>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error)
            // res.send('fail')
        }
        else {
            console.log(info)
            console.log("Successfully mail has sent")
            // res.send('success')
        }
    })
}

function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({status: 'failure', message: msg}, null, 3));
}

function sendsms(to, message, res) {

    var smsurl = config.queenApi.sms.smsUrl;
    smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
    smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
    smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
    smsurl += '&message=' + encodeURIComponent(message);


    var options = {url: smsurl, include: true};

    curl.request(options, function (err, parts) {
        parts = parts.split('\r\n');
        var data = parts.pop()
            , head = parts.pop();
        // res.send(JSON.stringify({ status: 'success', message: data, url: smsurl}, null, 3));
    });
}

function checkParams(req, res, arr) {
    // Make sure each param listed in arr is present in req.query
    var missing_params = [];
    for (var i = 0; i < arr.length; i++) {
        if (!req.body[arr[i]]) {
            missing_params.push(arr[i]);
        }
    }
    if (missing_params.length == 0) {
        return true;
    }
    else {
        senderror("Missing Params", res);
        return false;
    }
}

function sendTransferDetails(doc, res) {

    var docs = JSON.parse(JSON.stringify(doc));

    for (var i = 0; i < docs.length; i++) {

        delete docs[i]['__v'];
        delete docs[i]['_id'];

        delete docs[i]['user_id'];
        // delete docs[i]['email'];
        // delete docs[i]['mobile'];
    }

    var data = {};

    data['status'] = "success";

    data['transferList'] = docs;

    res.json(data);
}
