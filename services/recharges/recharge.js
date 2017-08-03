// /**
//  * Created by sabash ls on 01/11/16.
//  */
//
// var db = require('./../../model/recharge');
// var user = require('./../../model/user');
// var bal = require('./../../model/transfer');
// var Notify = require('./../../masters/notification');
// var config = require('./../../masters/config');
// var curl = require('curlrequest');
//
//
// var dbJri = require('./../../model/rechargeJRI');
// var jriCredential = require('./../../model/credential');
// var md5 = require('js-md5');
// var schedule = require('node-schedule');
//
// var cron = require('node-cron');
//
// cron.schedule('*/3 * * * *', function(){
//     console.log('JRI Pending status has callled for every two minutes');
//
//     jriRechargeStatus()
// });
//
//
// var authKey_recharge;
//
// var corporateId__recharge;
//
// var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(0, 7)];
// rule.hour = [7,19];
// rule.minute = [1,10];
//
// var j = schedule.scheduleJob(rule, function(){
//
//     console.log('Schedule Login Key is working');
//     jriLogin()
//
// });
//
//
// jriLogin()
//
// createLogin()
//
//
// var balance = 'https://api.justrechargeit.com/JRICorporateRecharge.svc/secure/GetCorporateCardBalance';
//
//
//
//
//
//
//
// /*** ==========>  User recharge API functions <===========***/
//
// exports.recharge = function (request, response) {
//
//     try {
//
//         console.log('enter the rechage middleware', request.body);
//
//         var mustparams = ["user_id", "type", "service", "amount"];
//
//         if (!checkParams(request, response, mustparams)) return;
//
//         user.findById(request.body.user_id, function (err, doc) {
//
//             if (err || !doc) {
//                 senderror("User Not found.", response);
//                 return;
//             }
//
//
//             var userdata = doc.toJSON();
//             var useremail = userdata['email'];
//             var usermobile = userdata['mobile'];
//
//             var recharge = new db(request.body);
//
//             recharge.email = useremail;
//
//             var walletamount = userdata['wallet'];
//
//             console.log(walletamount, 'wallleettt amount', recharge.amount);
//
//             if (Math.ceil(walletamount) < 20) {
//                 senderror("Your wallet amount should be minimum Rs 20. ", response);
//                 return;
//             }
//
//             if (Math.ceil(walletamount) < 0) {
//                 senderror("Insufficient balance. Please check your wallet balance", response);
//                 return;
//             }
//             if (Math.ceil(walletamount) < request.body.amount) {
//                 senderror("Insufficient balance. Please check your wallet balance", response);
//                 return;
//             }
//
//             if (request.body.amount >= 101) {
//                 senderror("Your maximum recharge limit is Rs 100 only", response);
//                 return;
//             }
//
//             walletamount = Math.ceil(walletamount) - Math.ceil(recharge.amount);
//
//
//             if (config.jriApi) {
//
//                 console.log("Recharge has been done in JRI Provider")
//
//                 jriRecharge(recharge,walletamount,request, response)
//
//             }
//
//             else{
//
//                 console.log("Recharge has been done in Queen Provider")
//
//                 var rechargetype = recharge.type;
//
//                 dorecharge(recharge.service, recharge.mobile, recharge.amount, function (rechargeResult) {
//
//                     if (rechargeResult) {
//
//                         console.log("callback Rechargeeee", rechargeResult)
//
//                         if (rechargeResult.status == 'Success') {
//
//                             user.findByIdAndUpdate(request.body.user_id, {wallet: walletamount}, {new: true}, function (err, doc) {
//
//                                 if (err) {
//
//                                     senderror("failed to update wallet & recharge failed", response);
//                                 }
//
//                                 else {
//
//                                     recharge['recharge_id'] = rechargeResult.recharge_id;
//                                     recharge['status'] = 'pending';
//                                     recharge['serviceProvider'] = 'Queen';
//                                     recharge['amount'] = rechargeResult.amount;
//                                     recharge['service'] = rechargeResult.service;
//                                     recharge['mobile'] = rechargeResult.mobile;
//
//                                     db.create(recharge, function (err, doc) {
//                                         if (err) {
//                                             senderror("failed to recharge", response);
//                                             return
//                                         }
//                                         else {
//
//                                             console.log("Recharge has done successfully ");
//
//                                             response.setHeader('Content-Type', 'application/json');
//                                             response.send(JSON.stringify({
//                                                 status: 'pending',
//                                                 message: 'Recharge conformation Processing',
//                                                 wallet: walletamount
//                                             }, null, 3));
//                                         }
//                                     })
//                                 }
//                             });
//
//                         }
//
//                         else {
//
//                             console.log("Recharge failed in 2nd else");
//                             recharge['status'] = 'failure';
//                             recharge['serviceProvider'] = 'Queen';
//                             recharge['description'] = 'Your recharge is Failed';
//                             recharge['service'] = request.body.service;
//                             recharge['operator'] = request.body.operator;
//
//                             db.create(recharge, function (err, doc) {
//                                 if (err) {
//                                     senderror("failed to recharge", response);
//                                     return
//                                 }
//                                 else {
//                                     console.log('Recharge failed in 3rd else', doc)
//                                     senderror("Recharge Failed. Please Try Again ", response);
//                                 }
//                             })
//                         }
//                     }
//                     else {
//                         senderror("Recharge Failed. Please Try Again ", response);
//                     }
//                 });
//
//             }
//
//         });
//
//
//     }
//     catch (error) {
//         json = {
//             error: "Error: " + error.message
//         };
//         return senderror(error.message, response);
//     }
//
// }
//
// exports.jriRechargeResponse = function (request, response) {
//
//
//     console.log("recharge response params",request.query)
//
//     var rechargeObj = request.query;
//
//     var WalletUpdate;
//
//     if(request.query.Status=="0 | Recharge Successful" || request.query.Status == '0|Recharge Successful'){
//
//         console.log("Test this case")
//
//         db.findOne({jriReference:request.query.SystemReference},function(err,rechargeData){
//
//             if(rechargeData){
//
//                 rechargeData=rechargeData.toJSON()
//
//                 user.findOne({_id:rechargeData.user_id},function(err,userData){
//
//                     console.log("User Data Found")
//
//                     userData = userData.toJSON()
//
//                     if(userData){
//
//                         db.update({jriReference:request.query.SystemReference},{$set:{status:'success',description:'Your recharge is successful'}},function(err,jriUpdateResult){
//
//                             if(jriUpdateResult){
//
//
//                                 console.log(userData.mobile,'mobileNumber',rechargeObj.Amount)
//
//
//                                 rechargesms(userData.mobile, "Rs " + rechargeObj.Amount + " debited from your Sash.Cash wallet for recharge. Thank you.", response);
//
//                                 // rechargesms(userData.mobile, "Your friend " + userData .full_name + " has Recharge Rs " + rechargeObj.Amount + " to Our Sash.Cash Recharge. Thank you.", response);
//
//                                 rechargesms(userData.mobile,rechargeObj.Amount+" has been successfully recharged to this mobile no "+rechargeObj.Mobile+ ". Thank you.", response);
//
//
//                                 if(userData.device_type == 'web'){
//
//
//                                 }
//
//                                 else {
//
//                                     Notify.rechargeNotifySuccess(userData.push_token,userData,rechargeObj.amount)
//
//                                 }
//
//                                 response.send('Successfully updated')
//                             }
//
//                             else {
//                                 console.error('err1')
//                                 response.send(' Recharge Update Status Failed')
//                             }
//                         })
//                     }
//
//                     else {
//                         console.error('err2')
//                         response.send('Invalid User')
//                     }
//
//                 })
//             }
//
//             else {
//                 console.error('err1')
//                 response.end('Invalid Transaction ID')
//                 return;
//             }
//         })
//
//     }
//
//     else{
//
//         console.log(request.query.OrderNo,'OrderNo')
//
//         console.log(request.query,'Failed Status')
//
//         db.findOne({jriReference:request.query.SystemReference},function(err,rechargeData){
//
//             if(rechargeData){
//
//                 rechargeData=rechargeData.toJSON()
//
//                 user.findOne({_id:rechargeData.user_id},function(err,userData){
//                     if(userData){
//
//                         userData=userData.toJSON()
//
//                         walletUpdate=parseInt(userData.wallet)+parseInt(rechargeObj.Amount)
//
//                         walletUpdate1=userData.wallet+parseInt(rechargeObj.Amount)
//
//
//                         db.update({jriReference:request.query.SystemReference},{$set:{status:'failure',description:'We have refunded the amount to your Sash.Cash wallet'}},function(err,updateRechargeData){
//                             if(updateRechargeData){
//
//                                 user.update({_id:rechargeData.user_id},{$set:{wallet:walletUpdate}},function(err,updateWallet){
//                                     if(updateWallet){
//
//                                         rechargesms(userData.mobile, "Rs " + rechargeData.amount + " credited from your Sash.Cash account for Last recharge failed. Please Recharge Again.", response);
//
//                                         if(userData.device_type=='web'){
//
//                                         }
//
//                                         else{
//
//                                             Notify.rechargeNotifyFailure(userData.push_token,userData,rechargeObj.amount)
//                                         }
//
//                                         response.send('Sucessss')
//                                     }
//
//                                     else {
//                                         console.error('err4')
//                                         response.send('Update User Wallet Failed')
//                                     }
//                                 })
//
//                             }
//
//                             else {
//                                 console.error('err4')
//                                 response.send('Update Recharge Status Failed')
//                             }
//                         })
//                     }
//
//                     else {
//                         console.error('err2')
//                         response.send('Invalide User')
//                     }
//
//                 })
//             }
//
//             else {
//                 console.error('err1')
//                 response.end('Invalide Transaction ID')
//                 return;
//             }
//
//         })
//
//     }
//
//
// }
//
//
// /*** ==========> User recharge History API functions <===========***/
//
// exports.rechargeHistory = function (request, response) {
//
//     try {
//
//         console.log('rechargeHistory', request.body)
//
//         var criteria = {}
//
//         user.findById(request.body.user_id, function (err, doc) {
//
//             if (err || !doc) {
//
//                 senderror("User Not found.", response);
//                 return;
//
//             } else {
//
//                 if (request.body.select_date) {
//
//                     var date = new Date(request.body.select_date);
//                     date.setHours(0, 0, 0, 0);
//                     var endDate = new Date(date);
//                     endDate.setHours(23, 59, 59, 59);
//                     criteria['user_id'] = request.body.user_id
//                     criteria['updated_at'] = {$gte: date, $lte: endDate}
//
//                 } else {
//
//                     criteria['user_id'] = request.body.user_id
//                 }
//
//                 db.find(criteria).sort('-updated_at').exec(function (err, doc) {
//
//                     if (err) {
//
//                         senderror("No Recharge found.", response);
//
//                     } else {
//
//                         console.log('successssssss', doc.length)
//                         sendRechargeDetails(doc, response);
//                     }
//                 });
//             }
//         });
//
//     } catch (error) {
//
//         json = {
//             error: "Error: " + error.message
//         };
//
//         return senderror("Exception Occurred", response);
//     }
// }
//
//
//
// /***  Queen Recharge API Purpose Only  ***/
//
// exports.rechargeResponce = function (request, response) {
//
//     try {
//
//         //  http://test.sash.cash:4001/recharge/rechargeResponse?accountId=12454&txid=45485857878&transStatus=success&amount=10
//
//         var mustparams = ["accountId", "txid", "transStatus", "amount"];
//         if (!checkParams(request, response, mustparams)) return;
//
//
//         function checkParams(req, res, arr) {
//             // Make sure each param listed in arr is present in req.query
//             var missing_params = [];
//             for (var i = 0; i < arr.length; i++) {
//                 if (!req.query[arr[i]]) {
//                     missing_params.push(arr[i]);
//                 }
//             }
//             if (missing_params.length == 0) {
//                 return true;
//             }
//             else {
//                 senderror("Invalide format", res);
//                 return false;
//             }
//         }
//
//         console.log(request.query)
//
//         var rechargeObj = request.query;
//
//         var WalletUpadte
//         // request.query = JSON.stringify(request.query)
//         console.log(0,request.query.txid)
//
//         if (request.query.transStatus == 'success' || request.query.transStatus == 'Success'){
//
//             db.findOne({recharge_id : request.query.accountId},function (err,rechgData) {
//
//                 if (rechgData){
//                     rechgData = rechgData.toJSON()
//                     user.findOne({_id:rechgData.user_id},function(error,findData){
//                         findData = findData.toJSON()
//                         if (findData){
//                             db.update({recharge_id:request.query.accountId},{$set:{status:'success',description:'Your recharge is successful'}},function (err1,updateData) {
//                                 if(updateData){
//                                     console.log(findData.mobile,'mobileNumber',rechargeObj.amount)
//
//                                     rechargesms(findData.mobile, "Rs " + rechargeObj.amount + " debited from your Sash.Cash wallet for recharge. Thank you.", response);
//
//                                     rechargesms(rechgData.mobile, "Your friend " + findData.full_name + " has Recharge Rs " + rechargeObj.amount + " to Our Sash.Cash Recharge. Thank you.", response);
//
//                                     if(findData.device_type == 'web'){
//
//                                     }else {
//                                         Notify.rechargeNotifySuccess(findData.push_token,findData,rechargeObj.amount)
//                                         // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
//                                     }
//
//                                     response.send('Success')
//
//                                 }
//
//                                 else {
//                                     console.error('err4')
//                                     response.send('Update Recharge Status Failed')
//                                 }
//                             })
//
//
//                         }
//
//                         else {
//                             console.error('err2')
//                             response.send('Invalide User')
//                         }
//
//                     })
//
//                 }
//                 else {
//                     console.error('err1')
//                     response.end('Invalide Transaction ID')
//                     return;
//                 }
//             })
//
//         } else {
//             console.log(request.query.accountId,'accountId')
//             db.findOne({recharge_id : request.query.accountId},function (err,rechgData) {
//                 console.log(rechgData)
//                 if (rechgData){
//                     console.error('SUCCES11')
//                     rechgData = rechgData.toJSON()
//                     console.log(rechgData,'RechargeUserdataaa')
//                     user.findOne({_id:rechgData.user_id},function(error,findData){
//                         console.log(findData,'Userdataaa')
//                         if (findData){
//                             console.error('SUCCES12')
//                             findData = findData.toJSON()
//
//                             console.error('SUCCES13')
//                             console.log('wallet',rechargeObj.amount,'number',parseInt(findData.wallet))
//                             WalletUpadte = parseInt(findData.wallet) + parseInt(rechargeObj.amount)
//                             WalletUpadte1 = findData.wallet + parseInt(rechargeObj.amount)
//                             console.log(WalletUpadte,'wallet1',findData.wallet,'nosss',parseInt(rechargeObj.amount))
//
//                             db.update({recharge_id:request.query.accountId},{$set:{status:'failure',description:'We have refunded the amount to your Sash.Cash wallet'}},function (err1,updateData) {
//                                 if(updateData){
//                                     console.error('SUCCES14')
//                                     user.update({_id:rechgData.user_id},{$set:{wallet:WalletUpadte}},function (err2,usrUpdateData) {
//                                         if (usrUpdateData){
//                                             console.error('SUCCES15')
//
//                                             rechargesms(findData.mobile, "Rs " + rechargeObj.amount + " credited from your Sash.Cash account for Last recharge failed. Please Recharge Again.", response);
//
//                                             if(findData.device_type == 'web'){
//
//                                             }else {
//                                                 Notify.rechargeNotifyFailure(findData.push_token,findData,rechargeObj.amount)
//                                                 // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
//                                             }
//
//                                             response.send('Sucess')
//                                         } else {
//
//                                             console.error('err4')
//                                             response.send('Update User Wallet Failed')
//
//                                         }
//                                     })
//                                 }
//                                 else {
//
//                                     console.error('err4')
//                                     response.send('Update Recharge Status Failed')
//
//                                 }
//
//                             })
//
//                         } else {
//                             console.error('err2')
//                             response.send('Invalide User')
//                         }
//
//                     })
//
//                 }
//                 else {
//                     console.error('err1')
//                     response.end('Invalide Transaction ID')
//                     return;
//                 }
//             })
//
//         }
//         function rechargesms(to, message, res) {
//
//             var smsurl = config.queenApi.sms.smsUrl;
//             smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
//             smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
//             smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
//             smsurl += '&message=' + encodeURIComponent(message);
//
//             var options = {url: smsurl, include: true};
//
//             curl.request(options, function (err, parts) {
//                 parts = parts.split('\r\n');
//                 var data = parts.pop()
//                     , head = parts.pop();
//
//             });
//         }
//     }
//
//     catch (error) {
//
//         json = {
//             error: "Error: " + error.message
//         };
//
//         return senderror("Exception Occurred", response);
//     }
//
// }
//
// exports.rechageStatus = function (request,response) {
//     try {
//         console.log(request.body)
//         var mustparams = ["recharge_id"];
//         if (!checkParams(request, response, mustparams)) return;
//
//
//         function checkParams(req, res, arr) {
//             // Make sure each param listed in arr is present in req.query
//             var missing_params = [];
//             for (var i = 0; i < arr.length; i++) {
//                 if (!req.body[arr[i]]) {
//                     missing_params.push(arr[i]);
//                 }
//             }
//             if (missing_params.length == 0) {
//                 return true;
//             }
//             else {
//                 senderror("Invalide format", res);
//                 return false;
//             }
//         }
//
//         db.findOne({recharge_id : request.body.recharge_id},function (err,rechgData) {
//             console.log(rechgData)
//             if (rechgData) {
//                 if(rechgData.status == 'pending'){
//                     response.json({status:'pending',message:'Wait for Operator Conformation...'})
//                 } else {
//                     sendRechargeDetails(rechgData, response)
//                 }
//             } else {
//                 senderror("Invalide RechargeId", res);
//                 return false;
//             }
//         })
//     }
//     catch (error) {
//         json = {
//             error: "Error: " + error.message
//         };
//         return senderror("Exception Occurred", response);
//     }
// }
//
//
//
// /*Recharge SMS*/
//
// function rechargesms(to, message, res) {
//
//     console.log(to,"sms msg",message)
//
//     var smsurl = config.queenApi.sms.smsUrl;
//     smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
//     smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
//     smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
//     smsurl += '&message=' + encodeURIComponent(message);
//
//     var options = {url: smsurl, include: true};
//
//     curl.request(options, function (err, parts) {
//         parts = parts.split('\r\n');
//         var data = parts.pop()
//             , head = parts.pop();
//
//     });
// }
//
// function jriRechargeStatus(){
//
//     db.find({status:'pending',serviceProvider:'JRI'},function(err,rechargeStatus){
//
//         if(err){
//
//             console.log("rechargeStatus",err)
//         }
//
//         else
//         {
//
//             console.log("rechargeStatus",rechargeStatus)
//
//             rechargeStatus.forEach(function(val,i){
//
//                 var SystemReference=rechargeStatus[i].jriReference
//
//
//                 /*  console.log("SystemReference",SystemReference)*/
//
//                 var rechargeStatusData={
//
//                     "CorporateId":corporateId__recharge,
//
//                     "SecurityKey":config.jriApi.SecurityKey,
//
//                     "AuthKey":authKey_recharge,
//
//                     "SystemReference":SystemReference
//
//                 }
//
//
//                 /* console.log("rechargeStatusData.SystemReference",rechargeStatusData.SystemReference)*/
//
//                 var options={
//
//                     url:config.jriApi.rechargeStatusUrl,
//
//                     method:"POST",
//
//                     headers: {
//
//                         "Content-Type": "application/json",
//                     },
//
//                     data:JSON.stringify(rechargeStatusData),
//
//                     include: true
//                 }
//
//
//                 curl.request(options,function(err,part){
//                     if(err){
//
//                         console.log("recharge Error",err)
//                     }
//
//                     console.log(response)
//
//
//                     var response=part.split('\r\n');
//
//                     var rechargeResponse=response[response.length-1]
//
//                     var rechargeResponse=JSON.parse(rechargeResponse)
//
//                     console.log("rechargeStatus response",rechargeResponse)
//
//                     /*
//                      dbJri.findOne({systemReference:rechargeResponse.SystemReference},function(err,saveRechargeStatus){
//                      if(err){
//                      console.log(err)
//                      }
//
//                      else{
//                      console.log("saveRechargeStatus",saveRechargeStatus)
//                      }
//                      })*/
//
//                     if(rechargeResponse.Status=="0 | Recharge Successful" || rechargeResponse.Status=="0|Recharge Successful" ){
//
//                         var rechargeStatus="Successful"
//
//                         var descript="Your Recharge is Successful"
//
//                     }
//
//                     else{
//
//                         var rechargeStatus="Failed"
//
//                         var descript="Your Recharge is Failed"
//
//                         console.log("rechargeStatus",rechargeStatus)
//                     }
//
//
//                     db.findOneAndUpdate({jriReference:rechargeResponse.SystemReference},{$set:{status:rechargeStatus,reason:rechargeResponse.Status,description:descript}},function(err,saveRechargeStatus){
//
//                         if(err){
//
//                             console.log("Error Status")
//                         }
//
//                         else{
//
//                             var userID=saveRechargeStatus.toJSON();
//
//                             console.log(typeof(user),"Status chekcing user id",userID.user_id)
//
//                             user.findById(userID.user_id,function(err,userData){
//
//                                 if(err){
//
//                                     console.log("Status Checking Error",err)
//                                 }
//
//                                 else{
//
//                                     var userData=userData.toJSON()
//
//                                     if(rechargeResponse.Status=="0 | Recharge Successful" || rechargeResponse.Status=="0|Recharge Successful"){
//
//                                         console.log("saveRechargeStatus succes msg")
//
//                                         rechargesms(userData.mobile, "Rs " + rechargeResponse.Amount + " debited from your Sash.Cash wallet for recharge. Thank you.", response);
//                                     }
//
//                                     else
//
//                                     {
//
//                                         var walletAmount = Math.ceil(userData.wallet) + Math.ceil(rechargeResponse.Amount);
//
//                                         user.findByIdAndUpdate(userID.user_id,{wallet:walletAmount},function(err,userData){
//                                             if(err){
//
//                                                 console.log("Wallet amount error",err)
//
//                                             }
//
//                                             else{
//
//                                                 var userData=userData.toJSON()
//
//                                                 console.log("saveRechargeStatus Failed msg")
//
//                                                 rechargesms(userData.mobile, "Rs " + walletAmount+ " credited from your Sash.Cash account for Last recharge failed. Please Recharge Again.", response);
//                                             }
//
//
//                                         })
//
//                                     }
//
//                                 }
//
//                             })
//
//                         }
//                     })
//
//
//                 })
//
//             })
//         }
//
//
//     })
// }
//
// function jriRecharge(recharge,walletamount,req,res){
//
//     console.log("recharge******* jri value",recharge,walletamount)
//
//     if(recharge.type=="TopUp"){
//
//         var rechargetype ="M"
//     }
//
//     else{
//
//         var rechargetype ="D"
//
//         if(recharge.operator=="TataSky"){
//             recharge.operator="Tata Sky"
//         }
//         else if(recharge.operator=="AirtelDTH"){
//             recharge.operator="Airtel"
//         }
//
//         else if(recharge.operator=="VideoconD2H"){
//             recharge.operator="Videocon D2h"
//         }
//         else if(recharge.operator=="RelianceBigTv"){
//             recharge.operator="Big TV"
//         }
//         else if(recharge.operator=="SunDirect"){
//             recharge.operator="Sun Direct"
//         }
//         else {
//             recharge.operator="DISH TV DTH"
//         }
//
//     }
//
//     doJriReach(recharge.operator,recharge.mobile,recharge.amount,rechargetype,function(rechargeResult){
//
//         var rechargeResponse=JSON.parse(rechargeResult);
//
//         console.log('77',rechargeResponse)
//
//         if(rechargeResponse){
//
//             if(rechargeResponse.Status=="1 | Recharge in Process" ){
//
//                 user.findByIdAndUpdate(req.body.user_id,{wallet:walletamount}, {new:true}, function(err,doc){
//
//                     if(err){
//
//                         senderror("failed to update wallet & recharge failed", res);
//                     }
//
//                     else{
//
//                         var userData=doc.toJSON();
//
//                         console.log(userData.mobile,"Recharge Pending status check",typeof(doc))
//
//                         recharge['status'] = 'pending';
//                         recharge['serviceProvider'] = 'JRI';
//                         recharge['amount'] = rechargeResponse.Amount;
//                         recharge['service'] = rechargeResponse.Provider;
//                         recharge['mobile'] = rechargeResponse.MobileNo;
//                         recharge['jriReference'] = rechargeResponse.SystemReference;
//                         recharge['transactionRef'] = rechargeResponse.TransactionReference;
//
//                         db.create(recharge,function(err,saveRecords){
//
//                             if(err){
//
//                                 senderror("failed to recharge", res);
//                                 return
//                             }
//
//                             else{
//
//                                 reachargeState = {
//                                     status: 'pending',
//                                     message:'Recharge conformation in Processing',
//                                     wallet: walletamount
//                                 }
//
//                                 res.send(reachargeState)
//
//
//                             }
//
//                         })
//
//                     }
//
//                 })
//
//             }
//
//             else if(rechargeResponse.Status=="0 | Recharge Successful"){
//
//                 user.findByIdAndUpdate(req.body.user_id,{wallet:walletamount}, {new:true}, function(err,doc){
//
//                     if(err){
//
//                         senderror("failed to update wallet & recharge failed", res);
//                     }
//
//                     else{
//
//                         var userData=doc.toJSON();
//
//                         console.log(userData.mobile,"Recharge Success check",typeof(doc))
//
//                         recharge['status'] = 'Success';
//                         recharge['serviceProvider'] = 'JRI';
//                         recharge['amount'] = rechargeResponse.Amount;
//                         recharge['service'] = rechargeResponse.Provider;
//                         recharge['mobile'] = rechargeResponse.MobileNo;
//                         recharge['jriReference'] = rechargeResponse.SystemReference;
//                         recharge['transactionRef'] = rechargeResponse.TransactionReference;
//                         recharge['description']="Your Recharge is Successful"
//
//
//                         db.create(recharge,function(err,saveRecords){
//
//                             if(err){
//
//                                 senderror("failed to recharge", res);
//                                 return
//                             }
//
//                             else{
//
//                                 reachargeState={
//                                     status: 'Success',
//                                     message:'Recharge has been Successfully done',
//                                     wallet: walletamount
//                                 }
//
//                                 rechargesms(userData.mobile, "Rs " +  rechargeResponse.Amount + " debited from your Sash.Cash wallet for recharge. Thank you.", res);
//
//                                 /*rechargesms(rechargeResponse.MobileNo, "Your friend " + userData .full_name + " has Recharged Rs " + rechargeObj.Amount + " to Our Sash.Cash Recharge. Thank you.", res);*/
//
//                                 rechargesms(userData.mobile,rechargeResponse.Amount+" has been successfully recharged to this mobile no "+rechargeResponse.MobileNo+ ". Thank you.", res);
//
//                                 res.send(reachargeState)
//
//                                 console.log("Recharge has done successfully",saveRecords);
//                             }
//
//                         })
//
//                     }
//
//                 })
//
//             }
//
//             else{
//
//                 user.findById(req.body.user_id, function(err,doc){
//                     if(err){
//                         console.log("failed err")
//                     }
//
//                     else{
//
//                         var userData=doc.toJSON();
//
//                         console.log("This error occur because when all the response status failure below case will occur")
//
//                         recharge['status']='Failed'
//                         recharge['serviceProvider'] = 'JRI';
//                         recharge['description']="Your Recharge is Failed"
//                         recharge['amount'] = rechargeResponse.Amount;
//                         recharge['reason']=rechargeResponse.Status;
//                         recharge['service']=rechargeResponse.Provider
//                         recharge['jriReference'] = rechargeResponse.SystemReference;
//                         recharge['transactionRef'] = rechargeResponse.TransactionReference;
//
//                         db.create(recharge,function(err,saveRecords){
//                             if(err){
//                                 senderror("failed to update in db. Db Error", res);
//                                 return
//                             }
//
//                             else{
//
//                                 rechargesms(userData.mobile, "Rs " + recharge.amount + " Your Last Recharge was failed . Please Try again later.", res);
//
//                                 senderror(rechargeResponse.Status, res);
//
//                             }
//
//                         })
//                     }
//                 })
//
//
//             }
//
//         }
//
//         else{
//
//             console.log("This error because when all the response undefined & not coming from JRI Recharge")
//
//             senderror(rechargeResponse.Status, res);
//         }
//
//     })
//
//
// }
//
// function doJriReach(service,mobile,amount,rechargetype,callback){
//
//     console.log(corporateId__recharge,"corporate Key authkey ",authKey_recharge)
//
//     var alpha="sashc"
//
//     var randomNo=alpha+Math.floor(Math.random()*(9999-1))+1
//
//     /*
//      var corporate_Id=corporateId__recharge
//
//      var authenticationKey=authKey_recharge
//
//      var corporate_Id="3167478"
//
//      var authenticationKey="36FA7E6E-D210-4208-BA51-A159015F3746";*/
//
//
//     jriCredential.findOne({identity:'Thamizhl'},function(err,result) {
//         if (err) {
//             console.log(err)
//         }
//
//         else {
//
//             console.log("jri credential result Api", result)
//
//
//             var sysRef=randomNo
//
//             var checkSum=md5(result.corporateId+result.password+mobile+amount+sysRef+config.jriApi.checkSum_key)
//
//             console.log(checkSum,"checkSum")
//
//             var rechargeData={
//
//                 "CorporateId":result.corporateId,
//
//                 "SecurityKey":config.jriApi.SecurityKey,
//
//                 "AuthKey":result.password,
//
//                 "Mobile":mobile,
//
//                 "Provider":service,
//
//                 "Amount":amount,
//
//                 // "ServiceType":"M",
//
//                 "ServiceType":rechargetype,
//
//                 "SystemReference":sysRef,
//
//                 "IsPostpaid":"N",
//
//                 "APIChkSum":checkSum
//
//             }
//
//             var options={
//
//                 url:config.jriApi.rechargeUrl,
//
//                 method:"POST",
//
//                 headers: {
//
//                     "Content-Type": "application/json",
//                 },
//
//                 data:JSON.stringify(rechargeData),
//
//                 include: true
//             }
//
//             curl.request(options,function(err,part){
//                 if(err){
//
//                     console.log("recharge Error",err)
//                 }
//
//                 console.log(response)
//
//
//                 var response=part.split('\r\n');
//
//                 var rechargeResponse=response[response.length-1]
//
//                 /*console.log("recharge response",rechargeResponse)*/
//
//                 callback(rechargeResponse);
//             })
//
//
//         }
//
//     })
//
// }
//
// function createLogin(){
//
//     console.log("Create Login Success")
//     var jrilogDetails={}
//
//     jrilogDetails.corporateId= '3167478',
//         jrilogDetails.password = 'E9BD722B-706F-4529-8E48-D2115AC27E15'
//     jrilogDetails.identity = 'Thamizhl'
//
//     // new dbJri(req.body);
//
//     var data=new jriCredential(jrilogDetails)
//
//     jriCredential.create(data,function(err,result){
//         if(err){
//             console.log(err)
//         }
//
//         else {
//
//             console.log(result)
//         }
//
//
//     })
// }
//
// function jriLogin(){
//
//     console.log("recharge Called")
//
//     if(config.jriApi){
//
//         var loginUrl=config.jriApi.loginUrl,
//
//             loginData={
//
//                 "SecurityKey":config.jriApi.SecurityKey,
//
//                 "EmailId":config.jriApi.EmailId,
//
//                 "Password":config.jriApi.Password,
//
//                 "APIChkSum":config.jriApi.loginAPIChkSum
//
//             }
//
//         var options={
//
//             url:loginUrl,
//
//             method:"POST",
//
//             headers: {
//
//                 "Content-Type": "application/json",
//             },
//
//             data:JSON.stringify(loginData),
//
//             include: true
//         }
//
//
//         curl.request(options,function(err,part){
//
//             if(err){
//
//                 console.log("err",err)
//             }
//
//             var response=part.split('\r\n');
//
//             var loginResponse=response[response.length-1]
//
//             console.log(loginResponse,"loginResponse")
//
//             var parseVal=JSON.parse(loginResponse);
//
//             authKey_recharge=parseVal.AuthenticationKey;
//
//             corporateId__recharge=parseVal.CorporateId;
//
//             console.log(authKey_recharge,"authKeyautoLogin",corporateId__recharge)
//
//
//             jriCredential.findOneAndUpdate({identity:"Thamizhl"},{$set:{corporateId:corporateId__recharge,password:authKey_recharge}},{new:true},function(err,result){
//
//                 if(err){
//
//                     console.log(err)
//                 }
//
//                 else {
//
//                     console.log("db result",result)
//                 }
//             })
//
//         })
//
//     }
//
//     else {
//
//         console.log("Recharge portal is working with queen provider it is a JRI Logi Response")
//     }
//
// }
//
//
//
//
//
// function dorecharge(service, number, amount, callback) {
//
//     console.log('service name', service)
//     console.log('amount', amount);
//     console.log('number', number);
//
//     // http://95.85.7.57:7998/SmsRechargeRequest?Mob=9043033456&message=RR+Reliance+8880060019+10+123456789&myTxId=123456789&source=API
//
//     var text = '';
//     var Result = {};
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     for (var i = 0; i < 7; i++)
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//
//
//     /* var balurl = config.queenApi.recharge.rechargeUrl+'Mob='+config.queenApi.recharge.mob;
//      smsurl += '&message=Bal+';
//      smsurl += '+'+config.queenApi.recharge.pin;*/
//
//
//     var smsurl = config.queenApi.recharge.rechargeUrl + 'Mob=' + config.queenApi.recharge.mob;
//     smsurl += '&message='+ service;
//     smsurl += '+' + number;
//     smsurl += '+' + amount;
//     smsurl += '+' + config.queenApi.recharge.pin;
//     smsurl += '&myTxId=' + text + '&source=API';
//
//     //Mob=9429045500&message=Bal+1234
//     // http://95.85.7.57:7998/SmsRechargeRequest?Mob=9171666444&message=RR+Airtel+9840773136+10+9827&myTxId=123456789&source=API
//     console.log('options******', smsurl);
//
//     var options = {url: smsurl, include: true};
//     /*var balace = {url: 'http://95.85.7.57:7998/SmsRechargeRequest?Mob=9171666444&message=Bal+9827', include: true};
//
//
//      curl.request(balace, function (err, parts, data) {
//      parts = parts.split('\r\n');
//
//      console.log(parts[parts.length - 1], "Balanceeee  successss");
//
//      })*/
//
//
//     curl.request(options, function (err, parts, data) {
//
//         parts = parts.split('\r\n');
//
//         console.log(parts, "successss Messagesss");
//         console.log(parts[parts.length - 1], "successss");
//         var RechargeDetail = parts[parts.length - 1];
//
//         var succ = new RegExp("Success");
//         var res = succ.test(RechargeDetail);
//
//         if (res == 'true' || res == true) {
//
//             var part = RechargeDetail.split(',');
//             console.log(part, "successss");
//             var patt = new RegExp("TxId");
//             var result = patt.test(part[2]);
//             if (result == 'true' || result == true) {
//                 var sts = part[0].split(':')
//                 var txid = part[2].split(':')
//                 var dgrs = part[3].split(':')
//                 var servicess = part[part.length - 1].split('*')
//                 if (sts && sts.length > 0) {
//                     Result['status'] = 'Success'
//
//                     if (txid && txid.length > 0) {
//                         Result['recharge_id'] = txid[1].replace(/ /g, '');
//                         Result['service'] = servicess[0].replace(/ /g, '');
//                         Result['amount'] = servicess[1].replace(/ /g, '');
//                         Result['mobile'] = servicess[2].replace(/ /g, '');
//                     }
//                 }
//             } else {
//                 Result['status'] = 'failure'
//                 Result['message'] = RechargeDetail
//             }
//
//             console.log(sts)
//             console.log(dgrs)
//             console.log(txid, servicess)
//             console.log('resulllttttt', Result)
//             callback(Result)
//         }
//         else {
//             Result['status'] = 'failure'
//             Result['message'] = RechargeDetail
//             callback(Result)
//         }
//
//     })
//
//
//
//
// }
//
// /*
//  * Common Methods
//  */
// function senderror(msg, res) {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(JSON.stringify({status: 'failure', message: msg}, null, 3));
// }
//
// function sendsms(to, message, res) {
//
//     var smsurl = config.queenApi.sms.smsUrl;
//     smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
//     smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
//     smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
//     smsurl += '&message=' + encodeURIComponent(message);
//
//     var options = {url: smsurl, include: true};
//
//     curl.request(options, function (err, parts) {
//         parts = parts.split('\r\n');
//         var data = parts.pop()
//             , head = parts.pop();
//
//     });
// }
//
// function sendRechargeDetails(doc, res) {
//
//     var docs = JSON.parse(JSON.stringify(doc));
//
//     for (var i = 0; i < docs.length; i++) {
//
//         delete docs[i]['__v'];
//         delete docs[i]['_id'];
//
//
//     }
//
//     var data = {};
//
//     data['status'] = "success";
//
//     data['rechargeList'] = docs;
//
//     res.json(data);
// }
//
//
//
//
//
//
// function checkParams(req, res, arr) {
//     // Make sure each param listed in arr is present in req.query
//     var missing_params = [];
//     for (var i = 0; i < arr.length; i++) {
//         if (!req.body[arr[i]]) {
//             missing_params.push(arr[i]);
//         }
//     }
//     if (missing_params.length == 0) {
//         return true;
//     }
//     else {
//         senderror("Missing Params", res);
//         return false;
//     }
// }
//
//
//
//
// /*exports.rechargeHistory = function(request, response) {
//
//  try {
//  user.findById(request.params.id, function (err, doc) {
//  if (err || !doc) {
//  senderror("User Not found.", response);
//  return;
//  }
//
//  db.find({'user_id':request.params.id}).sort('-updated_at').exec(function (err, doc) {
//  if (err) return next(err);
//  sendRechargeDetails(doc, response);
//  });
//  });
//
//
//  }
//  catch(error) {
//  json = {
//  error: "Error: " + error.message
//  };
//  return senderror( "Exception Occurred", response);
//  }
//
//  }*/