var fs = require("fs");
var config = require('./../../controllers/conf');
var curl = require('curlrequest');
var db = require('./../../model/recharge');
var refundDB = require('./../../model/refund');
var paymentDB = require('./../../model/payment');
var masterDB = require('./../../model/master');
var userDB = require('./../../model/user');
var Lo = require('lodash');

var curl = require('curlrequest');
var sha512 = require('js-sha512');
var schedule = require('node-schedule');
var md5 = require('js-md5');
var credentialDB = require('./../../model/credential');
var operatorDB = require('./../../model/operator');
var accountHistoryDB = require('./../../model/account_history');
var async=require('async');
var querystring = require('querystring');
var http = require('https');

var randomstring = require("randomstring");
var random = randomstring.generate({
    length: 8,
    charset: 'numeric',
});

/**
 *
 * @param req
 * @param res
 */
exports.opList = function (req, res) {

    var data = fs.readFileSync('./public/jsons/generalOperatorList.json');

    var opList = JSON.parse(data);

    var arr = [];

    for (var x in opList) {



        if(req.body.type==opList[x].type){

            // console.log("********",opList[x])

            arr.push(opList[x]);

        }

    }

    var responseObj = {}

    responseObj.status = "success";

    responseObj.data = {result:arr};

    res.json({status:'success',data:{result:arr}});

}

exports.opCircleList = function (req, res) {

    var data = fs.readFileSync('./public/jsons/operatorCircleList.json');

    var cicleList = JSON.parse(data);

    var responseObj = {}

    responseObj.status = "success";

    responseObj.data = {result:cicleList};

    res.send(responseObj);

}

exports.rechargePlanList=function(req,res){

    var rechargeData={

        "ServiceName":req.body.ServiceName,

        "ServiceProviderName":req.body.ServiceProviderName,

        "LocationName":req.body.LocationName

    }

    var options={

        url:config.jriApi.rechargePlanUrl,

        method:"POST",

        headers: {

            "Content-Type": "application/json",
        },

        data:JSON.stringify(rechargeData),

        include: true
    }

    curl.request(options,function(err,part){
        if(err){

            console.log("recharge Error",err)
        }




        var response=part.split('\r\n');

        var rechargeResponse=response[response.length-1]

        // console.log("recharge response",rechargeResponse)

        var rechargePlan=new Object()

        rechargePlan.status="success"

        rechargePlan.data={result:JSON.parse(rechargeResponse)}



        res.send(rechargePlan)
    })

}

exports.fetchOperator=function(req,res) {

    console.log("Request body", req.body)


    var data = fs.readFileSync('./public/jsons/fetchOperator.json');

    var opList = JSON.parse(data);


    if (req.body.recharge_number.length == 10) {


        db.findOne({mobile: req.body.recharge_number, status: 'success'}, function (err, result) {

            console.log("result", result)

            if (result) {
                console.log("Result data is hell")
                var opData = {}

                opData.recharge_number = result.recharge_number

                opData.operator = result.operator

                opData.location_name = result.location_name

                opData.location_key = result.location_key

                res.json({status:'success',data:{result:opData}});

            }
            else {

                // noDbRecords(req,res)

                specificOperator()

            }

        })
    }
    else {
        if (req.body.recharge_number.length >= 5) {

            specificOperator()
        }
        else {
            res.json({status:'failure',message:'Minimum enter five number'})
        }

    }



    function specificOperator() {

        var number = req.body.recharge_number

        var results = number.slice(0, 4)

        var clientList = [{"recharge_number": Number(results)}]

        var result = Lo.intersectionBy(opList, clientList, 'recharge_number');

        if (result.length == 0) {

            res.send({status: 'failure', data: {result: {}}});

        }
        else {
            res.send({status: 'success', data: {result: result[0]}});

        }

    }

}


exports.discountUserCalculation = function (req, res) {

    try {

        console.log("discount Userss Calculation Amount", req.body)

        userDB.findOne({_id: req.body.user_id}, function (err, userData) {

            if (err || !userData) {

                console.log("User not found")
                senderror("User not found. Please enter valid user details.", res);
                return;
            }

            else {
                //console.log("User found",userData)
                var data = userData.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {
                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;
                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({status: 'verify', data: data._id}));
                    return;
                }


                if (Number(req.body.used_wallet) > data.wallet) {

                    senderror("Wallet amount is greater than used wallet", res);
                    return;

                }


                console.log('calculation')

                masterDB.findOne({type: 'discount'}, function (err, result) {

                    if (err) {

                        console.log(err)

                        return senderror("Something Went Wrong", res);
                    }

                    else {

                        console.log(result, 'masterrrr Dataaaa Discount')


                        var random = randomstring.generate({
                            length: 10,
                            charset: 'numeric',
                        });
                        var randomNo = random

                        var waive = {}

                        var discountCompute = Math.abs(Number(req.body.used_wallet) - Number(req.body.amount))                //Ignore the negative value use math.abs

                        var reqDiscount = parseInt((Number(result.tax) / 100) * discountCompute)        // Avoid the Decimal value use parse Int

                        var usedDiscount = Number(data.used_discount_amount)

                        var mainDiscount = Number(data.user_discount_amount)

                        var userWallet = Math.ceil(data.wallet)


                        waive.firstname = userData.full_name
                        waive.transaction_id = randomNo,
                            waive.email = userData.email,
                            //waive.email='orders@sash.cash',
                            waive.mobile = userData.mobile,
                            waive.key = config.payuMoney.key,
                            waive.merchant_id = config.payuMoney.merchantId,
                            waive.success_url = config.payuMoney.surl,
                            waive.failure_url = config.payuMoney.furl,
                            waive.service_provider = config.payuMoney.service_provider,
                            waive.product_name = config.payuMoney.productinfo


                        waive.used_wallet = Number(parseInt(req.body.used_wallet))

                        waive.is_payment = "0"                                            // 0 is for amount taken from Payment gateway

                        console.log("Recharge amount is greater than wallet")


                        if (data.device_platform == 'android') {


                        if (usedDiscount >= mainDiscount) {

                            console.log("User Discount amount has exhausted")

                            waive.used_discount = 0;

                            waive.used_payment = Number(req.body.amount) - Number(waive.used_wallet)
                            waive.used_payment = waive.used_payment.toFixed(1)
                            waive.amount = Number(req.body.amount)
                            //waive amount is for cx has to pay that amount in payumoney.
                            hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|' + req.body.user_id + '|||||' + config.payuMoney.Salt

                            waive.hash = sha512(hashKey)

                            console.log("11111111111111111111111111111", waive)

                            res.send({status: 'success', data: {result: waive}})
                        }

                        else {

                            console.log("User Discount amount has not exhausted")
                            console.log(reqDiscount, mainDiscount)

                            if (reqDiscount >= mainDiscount) {

                                console.log("Requested Discount amount greater than main Discount amount")

                                waive.used_discount = mainDiscount - usedDiscount;

                                waive.used_payment = Number(req.body.amount) - (Number(waive.used_wallet) + Number(waive.used_discount))

                                waive.used_payment = waive.used_payment.toFixed(1)
                                waive.amount = Number(req.body.amount)

                                hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|' + req.body.user_id + '|||||' + config.payuMoney.Salt


                                waive.hash = sha512(hashKey)

                                console.log("222222222222222222222222222222", waive)

                                res.send({status: 'success', data: {result: waive}})

                            }

                            else {

                                console.log("Elseeeeeee")

                                waive.used_discount = reqDiscount

                                waive.used_payment = Math.abs(Number(req.body.amount)) - Math.abs(Number(waive.used_wallet) + Number(waive.used_discount))
                                waive.used_payment = waive.used_payment.toFixed(1)
                                waive.amount = Number(req.body.amount)

                                hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|' + req.body.user_id + '|||||' + config.payuMoney.Salt

                                waive.hash = sha512(hashKey)


                                console.log("33333333333333333333333333333333333")

                                res.send({status: 'success', data: {result: waive}})

                            }

                        }
                    }
                    else {

                            if (usedDiscount >= mainDiscount) {

                                console.log("User Discount amount has exhausted")

                                waive.used_discount = 0;

                                waive.used_payment = Number(req.body.amount) - Number(waive.used_wallet)
                                waive.used_payment =  waive.used_payment.toFixed(1)
                                waive.amount = Number(req.body.amount)
                                //waive amount is for cx has to pay that amount in payumoney.
                                hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|'+req.body.user_id+'||||||||||' + config.payuMoney.Salt

                                waive.hash = sha512(hashKey)

                                console.log("11111111111111111111111111111", waive)

                                res.send({status: 'success', data: {result: waive}})
                            }

                            else {

                                console.log("User Discount amount has not exhausted")
                                console.log(reqDiscount , mainDiscount)

                                if (reqDiscount >= mainDiscount) {

                                    console.log("Requested Discount amount greater than main Discount amount")

                                    waive.used_discount = mainDiscount - usedDiscount;

                                    waive.used_payment = Number(req.body.amount) - (Number(waive.used_wallet) + Number(waive.used_discount))

                                    waive.used_payment =  waive.used_payment.toFixed(1)
                                    waive.amount = Number(req.body.amount)

                                    hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|'+req.body.user_id+'||||||||||' + config.payuMoney.Salt


                                    waive.hash = sha512(hashKey)

                                    console.log("222222222222222222222222222222", waive)

                                    res.send({status: 'success', data: waive})

                                }

                                else {

                                    console.log("Elseeeeeee")

                                    waive.used_discount = reqDiscount

                                    waive.used_payment = Math.abs(Number(req.body.amount)) - Math.abs(Number(waive.used_wallet) + Number(waive.used_discount))
                                    waive.used_payment =  waive.used_payment.toFixed(1)
                                    waive.amount = Number(req.body.amount)

                                    hashKey = waive.key + '|' + waive.transaction_id + '|' + waive.used_payment + '|' + waive.product_name + '|' + waive.firstname + '|' + waive.email + '|'+req.body.user_id+'||||||||||' + config.payuMoney.Salt

                                    waive.hash = sha512(hashKey)


                                    console.log("33333333333333333333333333333333333")

                                    res.send({status: 'success', data: {result: waive}})

                                }
                            }
                        }

                    }
                })
            }

        })
    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);
    }

}






var rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [0,1,2,3,4,5,6];
rule2.hour = 20;
rule2.minute = 00;
schedule.scheduleJob(rule2, function(){
    console.log('This runs at 8:10PM every days');

    jriLogin()

   // portalChange9clkmorning()

    portalChange8Clk()

    allBalance()

});

// jriLogin()

var rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [0,1,2,3,4,5,6];
rule2.hour = 9;
rule2.minute = 00;
schedule.scheduleJob(rule2, function(){
    console.log('This runs at 9:10PM every days');

    jriLogin()

    portalChange9clkmorning()

    allBalance()
   // portalChange8Clk()

});



/*var j = schedule.scheduleJob('*!/1 * * * *', function(){

    console.log('JRI Balance checking');

    jriLogin()

});*/



//sendsms(config.alerts, "Sms alert tesing");



/*var balace = {url: 'http://95.85.7.57:7998/SmsRechargeRequest?Mob=9171666444&message=bal+9827', include: true};


 curl.request(balace, function (err, parts, data) {
 parts = parts.split('\r\n');

 console.log(parts[parts.length - 1], "Balanceeee  successss");

 })*/

// jriLogin()


function portalChange8Clk(){


    credentialDB.findOne({identity:config.queenApi.identity},function (errors,queenData) {

        if (errors || !queenData){

            var QueenData = {};
            QueenData.identity = config.queenApi.identity
          //  QueenData.balance = Number(bal[0])
            var data=new credentialDB(QueenData)

            credentialDB.create(data,function (createErr,createData) {

                if (createErr){
                    // res.send({status:'failure',message:'Record Not created'})
                    console.log({status:'failure',message:'Record Not created'})
                }
                else {
                    console.log({status:'success',message:'Record create successfully'})
                    queenBalance()

                }
            })

        }
        else {


                credentialDB.update({identity:config.queenApi.identity},{$set:{is_active:0}},function (queenErr,queenData) {

                    if(queenErr || !queenData){

                    }
                    else {
                        credentialDB.findOne({identity:config.jriApi.identity},function (errorJRI,jriFind) {

                            if(errorJRI || !jriFind){


                            }
                            else {

                                if(jriFind.balance <= jriFind.min_limit){

                                    credentialDB.update({identity:config.jriApi.identity},{$set:{is_active:1}},function (jriErr,jriData) {

                                    })
                                }
                                else {
                                    credentialDB.update({identity:config.jriApi.identity},{$set:{is_active:0}},function (jriErr,jriData) {

                                    })

                                }
                            }

                        })
                    }
                })
             }

         })
    }

function portalChange9clkmorning(){


    credentialDB.findOne({identity:config.queenApi.identity},function (errors,queenData) {

        if (errors || !queenData){

            var QueenData = {};
            QueenData.identity = config.queenApi.identity,
            QueenData.is_active = 1
          //  QueenData.balance = Number(bal[0])
            var data=new credentialDB(QueenData)

            credentialDB.create(data,function (createErr,createData) {

                if (createErr){
                    // res.send({status:'failure',message:'Record Not created'})
                    console.log({status:'failure',message:'Record Not created'})
                }
                else {
                    console.log({status:'success',message:'Record create successfully'})
                    queenBalance()

                }
            })

        }
        else {

                credentialDB.update({identity:config.queenApi.identity},{$set:{is_active:1}},function (queenErr,queenData) {

                    if(queenErr || !queenData){

                    }
                    else {
                        credentialDB.findOne({identity:config.jriApi.identity},function (errorJRI,jriFind) {

                            if(errorJRI || !jriFind){


                            }
                            else {

                                    credentialDB.update({identity:config.jriApi.identity},{$set:{is_active:0}},function (jriErr,jriData) {

                                    })


                            }

                        })
                    }
                })
             }

         })
    }

function allBalance() {

    console.log("Jri balance checking")
    jriBalance()

    console.log("Queen balance checking")
    queenBalance()

}

function jriLogin() {

    console.log("JRI Login Called API")

    var loginUrl=config.jriApi.loginUrl;

    loginData={

        "SecurityKey":config.jriApi.SecurityKey,

        "EmailId":config.jriApi.EmailId,

        "Password":config.jriApi.Password,

        "APIChkSum":config.jriApi.loginAPIChkSum

    }

    console.log(loginData,'loginData',loginUrl)

    var options={

        url:loginUrl,

        method:"POST",

        headers: {

            "Content-Type": "application/json",
        },

        data:JSON.stringify(loginData),

        include: true
    }


    curl.request(options,function(err,part){

        if(err){

            console.log("err",err)
        }

        var response=part.split('\r\n');

        var loginResponse=response[response.length-1]

        console.log(loginResponse," Just Recharge It loginResponse ",response)

        var parseVal=JSON.parse(loginResponse);

        authKey_recharge=parseVal.AuthenticationKey;

        corporateId__recharge=parseVal.CorporateId;

        console.log(authKey_recharge,"authKeyautoLogin",corporateId__recharge)


        credentialDB.findOne({identity:config.jriApi.identity},function (errors,jriData) {

            if (errors || !jriData){

                var jrilogDetails = {};

                jrilogDetails.corporateId = Number(corporateId__recharge),
                jrilogDetails.auth_key = authKey_recharge
                jrilogDetails.identity = config.jriApi.identity
                jrilogDetails.password = config.jriApi.Password


                var data=new credentialDB(jrilogDetails)

                credentialDB.create(data,function (createErr,createData) {

                    if (createErr){
                        // res.send({status:'failure',message:'Record Not created'})
                        console.log({status:'failure',message:'Record Not created'})
                    }
                    else {
                        console.log({status:'success',message:'Record create successfully'})
                        jriBalance()

                    }
                })
            }
            else {
                credentialDB.findOneAndUpdate({identity:config.jriApi.identity},{$set:{corporateId:Number(corporateId__recharge),auth_key:authKey_recharge}},{new:true},function(err,result){

                    if(err){

                        console.log(err)
                        // res.send(false)
                    }

                    else {
                        //res.send(true)
                        console.log("db result",result)
                       // jriBalance()
                    }
                })

            }
        })
    })


}


/****** Portal Balance Checking ******/


function jriBalance() {

    credentialDB.findOne({identity:config.jriApi.identity},function (errors,jriData) {

        if (errors || !jriData){

        }
        else {


            var data  = {"CorporateId": jriData.corporateId,"SecurityKey":config.jriApi.SecurityKey,"AuthKey":jriData.auth_key}

            var options = {

                url:'https://api.justrechargeit.com/JRICorporateRecharge.svc/secure/GetCorporateCardBalance',

                method:"POST",

                headers: {


                    "Content-Type": "application/json",
                },

                data:JSON.stringify(data),

                include: true
            }


            curl.request(options,function(err,part){

                if(err){

                    console.log("err",err)
                }

                var response=part.split('\r\n');

                var loginResponse=response[response.length-1]

                //  console.log(loginResponse,"loginResponse",response)

                var result = JSON.parse(loginResponse)

                console.log(result.Balance,"Balancesssssssssssssssssssss",result.Status)

                identity = config.jriApi.identity
                var bal = Number(result.Balance)

                credentialDB.update({ identity : config.jriApi.identity},{$set:{balance:bal,type:'thirdPartyApi',provider:'jri'}},function (Err,jriData) {

                    if(Err || !jriData){

                        console.log({status:'successes',error:Err})

                    }
                    else {
                        console.log({status:'success',data:result})

                        //sendsms(user.mobile, "Welcome to Sash.Cash. Your verification code: " + user.verification_code + " .", res);

                        sendsms(config.alerts, "Sms alert," +
                            "JRI balance :" +bal);



                    }

                })

            })



        }
    })


}

function queenBalance() {


    var balace = {url: 'http://95.85.7.57:7998/SmsRechargeRequest?Mob='+config.queenApi.recharge.mob+'&message=Bal+'+config.queenApi.recharge.pin+'&source=API', include: true};


    curl.request(balace, function (err, parts, data) {
        parts = parts.split('\r\n');



        var result = parts[parts.length - 1]
        console.log(result, "Balanceeee  successss");

        var regex = /(\d+)/g;
        var bal = result.match(regex);

        if(bal.length == 2){

            console.log(bal[0])

            credentialDB.findOne({identity:config.queenApi.identity},function (errors,jriData) {

                if (errors || !jriData) {

                    var QueenData = {};
                    QueenData.identity = config.queenApi.identity
                    QueenData.balance = Number(bal[0])


                    var data=new credentialDB(QueenData)

                    credentialDB.create(data,function (createErr,createData) {

                        if (createErr){
                            // res.send({status:'failure',message:'Record Not created'})
                            console.log({status:'failure',message:'Record Not created'})
                        }
                        else {
                            console.log({status:'success',message:'Record create successfully'})
                            queenBalance()

                        }
                    })



                }
                else {
                    credentialDB.update({identity: config.queenApi.identity}, {
                        $set: {
                            balance: bal[0],
                            type: 'thirdPartyApi',
                            provider: 'jri'
                        }
                    }, function (Err, jriData) {

                        if (Err || !jriData) {

                            console.log({status: 'successes', error: Err})

                        }
                        else {
                            console.log({status: 'success', data: result})

                            //sendsms(user.mobile, "Welcome to Sash.Cash. Your verification code: " + user.verification_code + " .", res);

                            sendsms(config.alerts, "Sms alert," +
                                "Queen balance :" + bal[0]);


                        }

                    })

                }
            })

        }
        else {
            console.log(bal.length)
            console.log(bal[0])
        }


    })




}







exports.specificRecharge = function (req, res) {

    try {

        console.log("Specific Recharge", req.body)

        userDB.findOne({_id: req.body.user_id},function (err, userData) {

            if (err || !userData) {

                console.log("User not found")
                senderror("User not found. Please enter valid user details.", res);
                return;
            }

            else {
                //console.log("User found",userData)
                var data = userData.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {
                    response.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;
                }

                if (data.verified == '0' || data.verified == 0) {

                    response.send(JSON.stringify({status: 'verify', data: data._id}));
                    return;
                }


                console.log('Specific Rechrage Information')



                db.findOne({_id:req.body.recharge_id}).populate('user').populate('payment').exec(function(Errors,rechargeData){


                    if(Errors ||!rechargeData){


                        senderror('Invalid recharge_id',res)
                        return

                    }
                    else {

                        res.send({status:'success',data:{result:rechargeData}});

                    }

                })


            }

        })
    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);
    }

}


exports.recentRecharge = function (req, res) {

    try {

        console.log("Recent Recharge", req.body)

        userDB.findOne({_id: req.body.user_id}, function (err, userData) {

            if (err || !userData) {

                console.log("User not found")
                senderror("User not found. Please enter valid user details.", res);
                return;
            }

            else {
                //console.log("User found",userData)
                var data = userData.toJSON()

                if (data.blocked == '1' || data.blocked == 1) {
                    res.send(JSON.stringify({
                        status: 'blocked',
                        message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                    }));
                    return;
                }

                if (data.verified == '0' || data.verified == 0) {

                    res.send(JSON.stringify({status: 'verify', data: data._id}));
                    return;
                }


                console.log('Specific Rechrage Information')

                var query ={}

                query.user = req.body.user_id;

                masterDB.findOne({"type" : "discount"}).exec(function (MasterErr,RechargeData) {

                    if(MasterErr){


                    } else {
                        if(req.body.type == 'all'){

                            query.type = {$in : ['recharge','transfer']}

                            console.log(query)
                            accountHistoryDB.find(query).populate('user').populate('payment').populate('recharge').sort({updated_at: -1}).exec(function(Errors,rechargeData){


                                if(Errors ||!rechargeData){


                                    senderror('Invalid recharge_id',res)
                                    return

                                }
                                else {

                                    res.send({status:'success',data:{result:rechargeData,discount:RechargeData.tax}});

                                }

                            })

                        }
                        else {

                            query.recharge_type = req.body.type

                            console.log(query)

                            db.find(query).populate('user').populate('payment').populate('recharge').sort({updated_at: -1}).exec(function(Errors,rechargeData){


                                if(Errors ||!rechargeData){


                                    senderror('Invalid recharge_id',res)
                                    return

                                }
                                else {

                                    res.send({status:'success',data:{result:rechargeData,discount:RechargeData.tax}});

                                }

                            })

                        }
                    }


                })





            }

        })
    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);
    }

}


exports.paymentKey=function(req,res){



    console.log(req.body)

    var alpha="cash"

    // var randomNo=alpha+Math.floor(Math.random()*(9999-1))+1
    var randomNo = randomstring.generate({
        length: 10,
        charset: 'numeric',
    });

    var payment={}

    user.findOne({_id:req.body.user_id},function(err,result){

        if(err){

            console.log(err)
        }
        else
        {

            console.log("result",result)

                payment.firstname=result.full_name
                payment.amount=req.body.amount,
                // payment.amount="5",
                payment.txnid=randomNo,
                payment.email=result.email,
                payment.phone=result.mobile,

                payment.key=config.payuMoney.key,
                payment.surl=config.payuMoney.surl,
                payment.furl=config.payuMoney.furl,
                payment.service_provider=config.payuMoney.service_provider,
                // payment.hash="ce361f82c0452e29c0e030abec02718dddaf38c63a01a48fc5d036fd346c405d78a88eeecfb3607d35191f6092ca43113b124709bfb091ed3709b815e14bc9e3",
                payment.productinfo=config.payuMoney.productinfo

            hashKey=payment.key+'|'+payment.txnid+'|'+payment.amount+'|'+payment.productinfo+'|'+payment.firstname+'|'+payment.email+'||||||'+config.payuMoney.Salt

            payment.hash=sha512(hashKey)

            res.send({status:'success',data:payment})

        }

    })

}

exports.rechargeData = function(req,res) {


    try {

        console.log(request.body,'Recharge Response ====================================>')

        var rechargeData = request.body;

        console.log(rechargeData)


        console.log('Recharge Response ====================================>')


        res.send({status:'success',})

    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);
    }

}

exports.recharge=function(req,res){

    try{

        console.log('enter the rechage middleware', req.body);

        // var mustparams = ["user_id", "recharge_type", "amount","is_payment","operator","recharge_number","discount_amount","plan_type","operator_type"];

        var mustparams = ["user_id", "recharge_type"];


        if (!checkParams(req, res, mustparams)) return;

        // if(req.body.is_payment==0 || req.body.is_payment=='0'){                  //  is_payment= 0 is wallet 1 is for pay u money recharge

        if(req.body.is_payment==1 || req.body.is_payment=='1'){                  //  is_payment= 1 is wallet, 0 is for pay u money recharge

            console.log("Recharge has been done in sashcsah wallet")

            scRecharge(req,res)

        }

        else {

            console.log("Recharge has been done in pay u money")

            res.send({data:"payumoney mode"})
        }

    }

    catch(error){

        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);

    }

}




/*JRI Recharge Staus API*/


exports.jriSignup = function (req,res) {



        console.log("Create signup Success")
        var jrilogDetails={}

        jrilogDetails.corporateId= '3167478',
            jrilogDetails.password = config.jriApi.Password
        jrilogDetails.identity = config.jriApi.identity

        // new dbJri(req.body);

        var data=new credentialDB(jrilogDetails)

        credentialDB.create(data,function(err,result){
            if(err){
                console.log(err)
                res.send({status:'failure',message:'create Failed'})
            }

            else {

                console.log(result)
                res.send({status:'success',message:'Record create successfully'})
            }


        })

}

exports.jriLogin = function (req,res) {

    
        console.log("JRI Login Called API")

         jriLogin()

        }

exports.balance = function (req,res) {



    console.log("Jri balance checking")
    jriBalance()

    console.log("Queen balance checking")
    queenBalance()


}



/*******  Recharge API  Start hera *******/

exports.rechargeAPI = function (req,res) {

try {

    console.log('==============================================')


    console.log(req.body)

    console.log('==============================================')

    var reqObj = req.body
   console.log(reqObj)
   console.log(reqObj.user_id)


    userDB.findOne({_id:reqObj.user_id}, function (err, findUser) {

        if (err || !findUser) {
            senderror("User not found. Please enter valid user details.", res);
        }
        else {


            var data = findUser.toJSON();

            console.log(data)


            if (data.blocked == '1' || data.blocked == 1) {

                res.send(JSON.stringify({
                    status: 'blocked',
                    message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                }));
                return;

            }

            if (data.verified == '0' || data.verified == 0) {

                res.send(JSON.stringify({status: 'verify', data:{result:{_id:data._id}}}));
                return;
            }



            if(reqObj.payment_type){


                if(reqObj.payment_type == 'payment'  ||  reqObj.payment_type == 'wallet&payment'){

                    if(reqObj.transaction_id){

                        paymentDB.findOne({txn_id:reqObj.transaction_id},function (error,payData) {

                            if(error || !payData){
                                senderror("Invalid TransctionId", res);
                                return;
                            }
                            else {

                                if(payData.payment_status == 'success') {



                                    if(req.body.used_payment == payData.amount){


                                        /*senderror("tesing successs", res);


                                         return;*/


                                        if(reqObj.payment_type == 'wallet&payment'){

                                            if(data.wallet < Number(reqObj.used_wallet)){
                                                senderror("Recharge amount is higher than wallet amount", res);
                                                return;
                                            }
                                            else {

                                                req.body.walletAmount = data.wallet - Number(reqObj.used_wallet)
                                                req.body.payment_status = payData.payment_status
                                                req.body.payment = payData._id
                                                portalChecking(req,res)

                                                /*
                                                 senderror("tesing successs", res);
                                                 return;*/
                                            }
                                        }
                                        else {
                                            req.body.walletAmount = data.wallet - Number(reqObj.used_wallet)
                                            req.body.payment_status = payData.payment_status
                                            req.body.payment = payData._id
                                            portalChecking(req,res)
                                        }

                                    }
                                    else {

                                        senderror("Invalid payment amount", res);
                                        return;
                                    }




                                }
                                else {

                                    senderror("Payment is failed please try again", res);
                                    return;
                                }
                            }

                        })
                    }
                    else {
                        senderror("Enter valid TranscationId", res);
                        return;
                    }
                }
                else {

                    if(data.wallet < Number(reqObj.amount)){
                        senderror("Recharge amount is higher than wallet amount", res);
                        return;
                    }
                    else {

                        req.body.walletAmount = data.wallet - Number(reqObj.amount)
                        portalChecking(req,res)

/*
                        senderror("tesing successs", res);
                        return;*/
                    }
                }
            }
            else {

                senderror("Invalide payment mode", res);
                return;

            }

        }
    })


}

catch (error){
    json = {
        error: "Error: " + error.message
    };
    return senderror(error.message, res);

}


}

    /* =============================> Portal Checking function Start here <=================================    */


/**   Which portal are now in active state
 *
 * @param reqObj {recharge_number:'98******34',amount:'10',circle:'chennai',operator:'aircel',.....etc}
 * @param res  ==> this Api response
 */
function portalChecking(req,res) {


    console.log('portalll Checkinggggggggggggg',req.body)

    credentialDB.findOne({identity:config.jriApi.identity},function (errors,jriData) {

        if (errors || !jriData) {

            console.log('pc1')

        }
        else {
            console.log('pc2',jriData)
            /**********  JRI portal is active staus checking  **********/

            if(jriData.is_active == 1 || jriData.is_active == '1'){

                /****  JRI Recharge Portal   ****/
                console.log('pc2')

                /****  JRI Portal Balance Checking  ****/

                /*if(jriData.balance <= req.body.amount){

                    senderror("Please try again later ", res);
                    return;

                }*/

                /****  JRI Recharge Function   ****/

                doRechargeJRI(req,res,jriData)

            }
            else {
                console.log('pc3')
                credentialDB.findOne({identity:config.queenApi.identity},function (errors,queenData) {

                    if (errors || !queenData) {
                        console.log('pc4')

                    }
                    else {
                        console.log('pc5')
                        /**********  Queen portal is active staus checking  **********/

                        if(queenData.is_active == 1 || queenData.is_active == '1'){

                            console.log('pc6',queenData.balance ,req.body.amount)
                            /****  Queen Recharge Portal   ****/


                            /****  Queen Portal Balance Checking  ****/

                            if(queenData.balance <= req.body.amount){

                                senderror("Messaging for valide content ", res);
                                return;

                            }

                            /****  Queen Recharge Function   ****/

                            doRechargeQueen(req,res,queenData)


                        }
                        else {
                            console.log('pc7')
                            /****  Which Portal is active autometically  ****/

                         //   activatePortal()

                        }


                    }
                })

            }

        }
    })



}


/**  DO JRI RECHARGE FUNCTION
 *
 * @param reqObj {recharge_number:'98******34',amount:'10',circle:'chennai',operator:'aircel',.....etc}
 * @param res  ==> this Api response
 * @param jriData {}
 */
function doRechargeJRI(req,res,jriData) {


      console.log('Do Recharge JRI')
      console.log(req.body,jriData)



         //   Mobile recharge Request E.g. :

            /*{"CorporateId":"1228119","SecurityKey":"S12345","AuthKey":"EBE4E618-F557-40C7-98C9-
                BEDEF723D8AF","Mobile":"9830012345","Provider":"Vodafone","Amount":"10","ServiceType":"M","Syste
                mReference":"TESTabc001","IsPostpaid":"","APIChkSum":"5a12d291f33b0d3bc0ce6e58bca90649"}

             Speaical Mobile recharge Request E.g. :


             {"CorporateId":"1228119","SecurityKey":"S12345","AuthKey":"EBE4E618-F557-40C7-98C9-
             BEDEF723D8AF","Mobile":"9830012345","Provider":"Docomo","Location":"Kolkata","Amount":"10","Ser
             viceType":"M","SystemReference":"TESTabc001":"","APIChkSum":"5a12d291f33b0d3bc0ce6e58bca90649"}
             VALUE"," APIChkSum":"CHECKSUM VALUE"}











                DTH recharge Request E.g. :

                {"CorporateId":"1228119","SecurityKey":"S12345","AuthKey":"EBE4E618-F557-40C7-98C9-
                    BEDEF723D8AF","Mobile":"1130012345","Provider":"TataSky","Amount":"10","ServiceType":"D","System
                    Reference":"TESTabc001","IsPostpaid":"","APIChkSum":"5a12d291f33b0d3bc0ce6e58bca90649"}

                    Datacard recharge Request E.g. :

                    {"CorporateId":"1228119","SecurityKey":"S12345","AuthKey":"EBE4E618-F557-40C7-98C9-
                        BEDEF723D8AF","Mobile":"9830012345","Provider":"Airtel","Amount":"10","ServiceType":"R","SystemR
                        eference":"TESTabc001","IsPostpaid":"","APIChkSum":"5a12d291f33b0d3bc0ce6e58bca90649"}






            */



                        var recharge = req.body;
                        var jriRechargeData = {}

                        if(recharge.recharge_type=="mobile" ){

                            jriRechargeData.rechargeType = 'M'

                        if(recharge.plan_type=="prepaid"){

                                jriRechargeData.planType = 'N'
                         }

                         if(recharge.plan_type=="postpaid"){

                                jriRechargeData.planType = "Y"
                         }

                        }
                        else {

                            if (recharge.recharge_type == "DTH") {

                                jriRechargeData.rechargeType = "D"

                                jriRechargeData.planType = "N"


                            }
                            else {

                                jriRechargeData.rechargeType = "R"

                                jriRechargeData.planType = "N"
                            }
                        }

              console.log(jriRechargeData)
            JriRecharge(recharge,res,jriData,jriRechargeData)


        }

/**
 *
 * @param reqObj {recharge_number:'98******34',amount:'10',circle:'chennai',operator:'aircel',.....etc}
 * @param res  ==> this Api response
 * @param jriData {}
 * @param jriRechargeData { rechargeType: 'R', planType: 'N' }
 * @constructor
 */

function JriRecharge(reqObj,res,jriData,jriRechargeData){


           console.log('jri Recharge Function')
           console.log(reqObj,jriData,jriRechargeData)


                var alpha="sashc"
                var recharge=reqObj

                var randomNo=randomstring.generate({
                    length: 8,
                    charset: 'numeric',
                })


                credentialDB.findOne({identity:config.jriApi.identity},function(err,result) {
                    if (err || !result) {
                        console.log(err)
                    }

                    else {

                        console.log(jriData,"jri credential result Api", result)

                        var sysRef=randomNo
                        var rechargeData
                        var options


                        console.log(result.corporateId,result.auth_key,reqObj.recharge_number,reqObj.amount,sysRef,config.jriApi.checkSum_key)
                        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')


                        var checkSum = md5(result.corporateId+result.auth_key+reqObj.recharge_number+reqObj.amount+sysRef+config.jriApi.checkSum_key)

                        console.log(checkSum,"checkSum")


                        /*var checkSum=md5(result.corporateId+result.auth_key+reqObj.recharge_number+reqObj.amount+sysRef+config.jriApi.checkSum_key)

                        console.log(checkSum,"checkSum")*/

                        if(recharge.operator=="DOCOMO" ||recharge.operator=="BSNL" ||recharge.operator=="MTNL" ||recharge.operator=="T24" ||recharge.operator=="Telenor" ||recharge.operator=="Videocon" ){

                             rechargeData={

                                "CorporateId":result.corporateId,

                                "SecurityKey":config.jriApi.SecurityKey,

                                "AuthKey":result.password,

                                "Mobile":recharge.recharge_number,

                                "Provider":recharge.operator,

                                "Amount":recharge.amount,

                                "ServiceType":jriRechargeData.rechargeType,

                                "Location":recharge.location_name,

                                "SystemReference":sysRef,

                                "IsPostpaid":jriRechargeData.planType,

                                "APIChkSum":checkSum

                            }

                             options={

                                url:config.jriApi.specialRechargeUrl,

                                method:"POST",

                                headers: {

                                    "Content-Type": "application/json",
                                },

                                data:JSON.stringify(rechargeData),

                                include: true
                            }

                        }

                        else{

                             rechargeData={

                                "CorporateId":result.corporateId,

                                "SecurityKey":config.jriApi.SecurityKey,

                                "AuthKey":result.auth_key,

                                "Mobile":reqObj.recharge_number,

                                "Provider":reqObj.operator,

                                "Amount":reqObj.amount,

                                "ServiceType":jriRechargeData.rechargeType,

                                "SystemReference":sysRef,

                                "IsPostpaid":jriRechargeData.planType,

                                "APIChkSum":checkSum

                            }

                             options={

                                url:config.jriApi.rechargeUrl,

                                method:"POST",

                                headers: {

                                    "Content-Type": "application/json",
                                },

                                data:JSON.stringify(rechargeData),

                                include: true
                            }


                        }



                        curl.request(options,function(err,part){
                            if(err){

                                console.log("recharge Error",err)
                            }




                            var response=part.split('\r\n');


                            console.log(response,'yttttttttttttttttttttttttttttttttttttttttttttttttttttt')

                            var rechargeResponse=response[response.length-1]


                            console.log(rechargeResponse,'/////////////////////////////////////////////////////////////////')

                            jriRequestResponce(rechargeResponse,reqObj,res)

                        })


                    }

                })

            }

/**
 *
  * @param rechargeResponse {"Amount":"10","IsPostpaid":"","MobileNo":"9841613363","Provider":"Aircel","ServiceType":"M","Status":"1 | Recharge in Process","SystemReference":"60483531","TransactionReference":"MQ00062515074"}}
 * @param reqObj {recharge_number:'98******34',amount:'10',circle:'chennai',operator:'aircel',.....etc}
 * @param res ==> this Api response
 */
function jriRequestResponce(rechargeResponse,reqObj,res) {


    /**
     * create new recharge db collections
     */

    var recharges = new db()


    /**
     * JRI recharge response string to JSON parse
     */

    rechargeResponse = JSON.parse(rechargeResponse)



    var result = rechargeResponse



    /**
     * Response  status  1 means recharge status is pending......
     */

    if(rechargeResponse.Status=="1 | Recharge in Process" ){


        console.log('Statussssss pendinggggg ifff')

               userDB.update({_id:reqObj.user_id},{$set:{wallet:reqObj.walletAmount}},function (UpdateErr,walletUpdate) {

               })


        if(reqObj.circle){
            recharges['circle'] = reqObj.circle;
        } if(reqObj.used_wallet){
            recharges['used_wallet'] = Number(reqObj.used_wallet);
        } if(reqObj.used_discount){
            recharges['used_discount'] = Number(reqObj.used_discount);
        } if(reqObj.used_payment){
            recharges['used_payment'] = Number(reqObj.used_payment);
        } if(reqObj.payment_type){
            recharges['payment_type'] = reqObj.payment_type
        } if(reqObj.recharge_type){
            recharges['recharge_type'] = reqObj.recharge_type;
        } if(reqObj.location_key){
            recharges['location_key'] = reqObj.location_key
        } if(reqObj.location_name){
            recharges['location_name'] = reqObj.location_name
        } if(reqObj.plan_type){
            recharges['plan_type'] = reqObj.plan_type
        } if(reqObj.user_id){
            recharges['user'] = reqObj.user_id
        } if(reqObj.transaction_id){
            recharges['payment_id'] = reqObj.transaction_id
        }if(reqObj.payment_status){
            recharges['payment_status'] = reqObj.payment_status
        }if(reqObj.is_payment){
            recharges['is_payment'] = reqObj.is_payment
        }
        if(reqObj.payment){
            recharges['payment'] = reqObj.payment
        }



        recharges['recharge_id'] = result.SystemReference;
        recharges['recharge_txn_id'] = result.TransactionReference;
        recharges['recharge_status'] = 'pending';
        recharges['serviceProvider'] = 'jri';
        recharges['portal'] = config.jriApi.identity;
        recharges['amount'] = reqObj.amount;
        recharges['operator'] = result.Provider;
        recharges['recharge_number'] = result.MobileNo;
        recharges['description']="Your Recharge is Pending ";

        console.log('Created Rechargeeeee',recharges)


        accountHistory(reqObj.user_id,recharges)


        db.create(recharges, function (err, doc) {
            if (err) {

                console.log(err,'createErrorssss')
                senderror("failed to recharge", response);
                return
            }
            else {

                console.log("Recharge has done successfully ");

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: 'success',
                    data:{result:{recharge_id:recharges._id}},

                }));
            }
        })



    }

    /**
     * Response  status  0 means recharge status is Success......
     */


    else if(rechargeResponse.Status=="0 | Recharge Successful"){

       console.log('Success data else ifffffffffffff')
        userDB.update({_id:reqObj.user_id},{$set:{wallet:reqObj.walletAmount}},function (UpdateErr,walletUpdate) {

        })


        if(reqObj.circle){
            recharges['circle'] = reqObj.circle;
        } if(reqObj.used_wallet){
            recharges['used_wallet'] = Number(reqObj.used_wallet);
        } if(reqObj.used_discount){
            recharges['used_discount'] = Number(reqObj.used_discount);
        } if(reqObj.used_payment){
            recharges['used_payment'] = Number(reqObj.used_payment);
        } if(reqObj.payment_type){
            recharges['payment_type'] = reqObj.payment_type
        } if(reqObj.recharge_type){
            recharges['recharge_type'] = reqObj.recharge_type;
        } if(reqObj.location_key){
            recharges['location_key'] = reqObj.location_key
        } if(reqObj.location_name){
            recharges['location_name'] = reqObj.location_name
        } if(reqObj.plan_type){
            recharges['plan_type'] = reqObj.plan_type
        } if(reqObj.user_id){
            recharges['user'] = reqObj.user_id
        } if(reqObj.transaction_id){
            recharges['payment_id'] = reqObj.transaction_id
        }if(reqObj.payment_status){
            recharges['payment_status'] = reqObj.payment_status
        }if(reqObj.is_payment){
            recharges['is_payment'] = reqObj.is_payment
        }
        if(reqObj.payment){
            recharges['payment'] = reqObj.payment
        }


        recharges['recharge_id'] = result.SystemReference;
        recharges['recharge_txn_id'] = result.TransactionReference;
        recharges['recharge_status'] = 'success';
        recharges['serviceProvider'] = 'jri';
        recharges['portal'] = config.jriApi.identity;
        recharges['amount'] = reqObj.amount;
        recharges['operator'] = result.Provider;
        recharges['recharge_number'] = result.MobileNo;
        recharges['description']="Your recharge is successfully";

        console.log('Created Rechargeeeee',recharges)

        accountHistory(reqObj.user_id,recharges)


        db.create(recharges, function (err, doc) {
            if (err) {

                console.log(err,'createErrorssss')

                senderror("failed to recharge", response);
                return
            }
            else {

                console.log("Recharge has done successfully ");

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: 'success',
                    data:{result:{recharge_id:recharges._id}},

                }));
            }
        })



    }

    /**
     * Response  status  -1 or else means recharge status is failed......
     */

    else{

        console.log('else  rechage faileddddddddd statusssssss')

        if(reqObj.circle){
            recharges['circle'] = reqObj.circle;
        }

        if(reqObj.used_wallet){
            recharges['used_wallet'] = Number(reqObj.used_wallet);
        }

        if(reqObj.used_discount){
            recharges['used_discount'] = Number(reqObj.used_discount);
        }

        if(reqObj.used_payment){
            recharges['used_payment'] = Number(reqObj.used_payment);
        }

        if(reqObj.payment_type){
            recharges['payment_type'] = reqObj.payment_type
        }
        if(reqObj.recharge_type){
            recharges['recharge_type'] = reqObj.recharge_type;
        }

        if(reqObj.location_key){
            recharges['location_key'] = reqObj.location_key
        }

        if(reqObj.location_name){
            recharges['location_name'] = reqObj.location_name
        }

        if(reqObj.plan_type){
            recharges['plan_type'] = reqObj.plan_type
        }

        if(reqObj.user_id){
            recharges['user'] = reqObj.user_id
        }
        if(reqObj.transaction_id){
            recharges['payment_id'] = reqObj.transaction_id
        }
        if(reqObj.payment_status){
            recharges['payment_status'] = reqObj.payment_status
        }
        if(reqObj.is_payment){
            recharges['is_payment'] = reqObj.is_payment
        }

        if(reqObj.payment){
            recharges['payment'] = reqObj.payment
        }


        recharges['recharge_id'] = result.SystemReference;
        recharges['recharge_txn_id'] = result.TransactionReference;
        recharges['recharge_status'] = 'failure';
        recharges['serviceProvider'] = 'jri';
        recharges['portal'] = config.jriApi.identity;
        recharges['amount'] = reqObj.amount;
        recharges['operator'] = result.Provider;
        recharges['recharge_number'] = result.MobileNo;
        recharges['description']="Your recharge is failed";


        accountHistory(reqObj.user_id,recharges)


        db.create(recharges, function (err, doc) {
            if (err) {

                senderror("failed to recharge", response);
                return
            }
            else {

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    status: 'success',
                    data:{result:{recharge_id:recharges._id}},

                }));
            }
        })

    }
 }

/*******  DO QUEEN RECHARGE FUNCTION *******/

function doRechargeQueen(request,response,queenData) {

    queenRecharge(request,response,queenData,function (rechargeResult) {


        var recharge = new db();
        queenBalance()

         if (rechargeResult) {

            console.log(request.body,"callback Rechargeeee", rechargeResult)

            if(rechargeResult.status == 'Success') {

                console.log('rechargeee sucess Status')

                userDB.findByIdAndUpdate(request.body.user_id, {wallet: request.body.walletAmount}, {new: true}, function (err, doc) {

                    if (err) {

                        senderror("failed to update wallet & recharge failed", response);
                    }

                    else {

                        console.log("Recharge Successsss")


                       if(request.body.circle){
                           recharge['circle'] = request.body.circle;
                       } if(request.body.used_wallet){
                            recharge['used_wallet'] = Number(request.body.used_wallet);
                       } if(request.body.used_discount){
                            recharge['used_discount'] = Number(request.body.used_discount);
                       } if(request.body.used_payment){
                            recharge['used_payment'] = Number(request.body.used_payment);
                       } if(request.body.payment_type){
                            recharge['payment_type'] = request.body.payment_type
                       } if(request.body.recharge_type){
                            recharge['recharge_type'] = request.body.recharge_type;
                       } if(request.body.location_key){
                            recharge['location_key'] = request.body.location_key
                       } if(request.body.location_name){
                            recharge['location_name'] = request.body.location_name
                       } if(request.body.plan_type){
                            recharge['plan_type'] = request.body.plan_type
                       } if(request.body.user_id){
                            recharge['user'] = request.body.user_id
                       } if(request.body.transaction_id){
                            recharge['payment_id'] = request.body.transaction_id
                       }if(request.body.payment_status){
                            recharge['payment_status'] = request.body.payment_status
                       }if(request.body.is_payment){
                            recharge['is_payment'] = request.body.is_payment
                       }
                        if(request.body.payment){
                            recharge['payment'] = request.body.payment
                        }

                        recharge['recharge_id'] = rechargeResult.recharge_id;
                        recharge['recharge_status'] = 'pending';
                        recharge['serviceProvider'] = 'Queen';
                        recharge['portal'] = config.queenApi.identity;
                        recharge['amount'] = rechargeResult.amount;
                        recharge['operator'] = request.body.operator;
                        recharge['recharge_number'] = rechargeResult.mobile;


                        console.log('Created Rechargeeeee',recharge)


                        accountHistory(request.body.user_id,recharge)


                        db.create(recharge, function (err, doc) {
                            if (err) {

                                console.log(err,'createErrorssss')
                                senderror("failed to recharge", response);
                                return
                            }
                            else {

                                console.log("Recharge has done successfully ");

                                response.setHeader('Content-Type', 'application/json');
                                response.send(JSON.stringify({
                                    status: 'success',
                                    data:{result:{recharge_id:recharge._id}},

                                }));
                            }
                        })
                    }
                });

            }

            else {

                console.log("Recharge failed in 2nd else");

                if(request.body.circle){
                    recharge['circle'] = request.body.circle;
                } if(request.body.used_wallet){
                    recharge['used_wallet'] = Number(request.body.used_wallet);
                } if(request.body.used_discount){
                    recharge['used_discount'] = Number(request.body.used_discount);
                } if(request.body.used_payment){
                    recharge['used_payment'] = Number(request.body.used_payment);
                } if(request.body.payment_type){
                    recharge['payment_type'] = request.body.payment_type
                } if(request.body.recharge_type){
                    recharge['recharge_type'] = request.body.recharge_type;
                } if(request.body.location_key){
                    recharge['location_key'] = request.body.location_key
                } if(request.body.location_name){
                    recharge['location_name'] = request.body.location_name
                } if(request.body.plan_type){
                    recharge['plan_type'] = request.body.plan_type
                } if(request.body.user_id){
                    recharge['user'] = request.body.user_id
                } if(request.body.transaction_id){
                    recharge['payment_id'] = request.body.transaction_id
                }if(request.body.payment_status){
                    recharge['payment_status'] = request.body.payment_status
                }if(request.body.is_payment){
                    recharge['is_payment'] = request.body.is_payment
                }if(request.body.amount){
                    recharge['amount'] = request.body.amount;
                }if(request.body.payment){
                    recharge['payment'] = request.body.payment
                }



                recharge['recharge_status'] = 'failure';
                recharge['serviceProvider'] = 'Queen';
                recharge['portal'] = config.queenApi.identity;
                recharge['description'] = 'Your recharge is Failed';
                recharge['service'] = request.body.plan_type;
                recharge['operator'] = request.body.operator;
                recharge['recharge_number'] = request.body.recharge_number;


                console.log('Created Rechargeeeee',recharge)

                accountHistory(request.body.user_id,recharge)


                db.create(recharge, function (err, doc) {
                    if (err) {

                        console.log(err,'createErrorssss')
                        senderror("failed to recharge", response);
                        return
                    }
                    else {
                        console.log('Recharge failed in 3rd else', doc)
                        response.send(JSON.stringify({
                            status: 'success',
                            data:{result:{recharge_id:recharge._id}},

                        }));
                    }
                })
            }
        }
        else {
            senderror("Recharge Failed. Please Try Again ", response);
        }
    });
}

/*****  QUEEN Recharge here   ******/
function queenRecharge(reqObj, response,queenData, callback) {

    console.log(reqObj.body.operator,'service name')



    operatorDB.findOne({operator:reqObj.body.operator},function(eRROS,fetchData) {

        if (eRROS || !fetchData) {

            senderror('Invalid operators',response)
            return

        }
        else {

            console.log(fetchData,'ELSEEEEEEEEEEEEEEEEEEEEEEE',reqObj.body)


            reqObj.body.operators = fetchData.queen_key




            var text = randomstring.generate({
                length: 8,
                charset: 'numeric',
            });
            var Result = {};

            //  http://95.85.7.57:7998/SmsRechargeRequest?Mob=9043033456&message=RR+Reliance+8880060019+10+123456789&myTxId=123456789&source=API


            var smsurl = config.queenApi.recharge.rechargeUrl + 'Mob=' + config.queenApi.recharge.mob;
            smsurl += '&message=' + reqObj.body.operators;
            smsurl += '+' + reqObj.body.recharge_number;
            smsurl += '+' + reqObj.body.amount;
            smsurl += '+' + config.queenApi.recharge.pin;
            smsurl += '&myTxId=' + text + '&source=API';

            console.log('options******', smsurl);

            var options = {url: smsurl, include: true};

            curl.request(options, function (err, parts, data) {

                parts = parts.split('\r\n');

                console.log(parts, "successss Messagesss");
                console.log(parts[parts.length - 1], "successss");
                var RechargeDetail = parts[parts.length - 1];

                var succ = new RegExp("Success");
                var res = succ.test(RechargeDetail);

                if (res == 'true' || res == true) {

                    var part = RechargeDetail.split(',');
                    console.log(part, "successss");
                    var patt = new RegExp("TxId");
                    var result = patt.test(part[2]);
                    if (result == 'true' || result == true) {
                        var sts = part[0].split(':')
                        var txid = part[2].split(':')
                        var dgrs = part[3].split(':')
                        var servicess = part[part.length - 1].split('*')
                        if (sts && sts.length > 0) {
                            Result['status'] = 'Success'

                            if (txid && txid.length > 0) {
                                Result['recharge_id'] = txid[1].replace(/ /g, '');
                                Result['service'] = servicess[0].replace(/ /g, '');
                                Result['amount'] = servicess[1].replace(/ /g, '');
                                Result['mobile'] = servicess[2].replace(/ /g, '');
                            }
                        }
                    } else {
                        Result['status'] = 'failure'
                        Result['message'] = RechargeDetail
                    }

                    console.log(sts)
                    console.log(dgrs)
                    console.log(txid, servicess)
                    console.log('resulllttttt', Result)
                    callback(Result)
                }
                else {
                    Result['status'] = 'failure'
                    Result['message'] = RechargeDetail
                    callback(Result)
                }

            })
        }
    })
}

function senderror(msg, res) {
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'failure', message: msg});
}

/***  SMS function write here ***/
function sendsms(to, message) {

    //New code

    var smsurl = config.queenApi.sms.smsUrl;
    smsurl += 'user=' + config.queenApi.sms.user + '&key=' + config.queenApi.sms.key;
    smsurl += '&senderid=' + config.queenApi.sms.senderId + '&accusage=1';
    smsurl += '&mobile=' + config.queenApi.sms.mobile + to;
    smsurl += '&message=' + encodeURIComponent(message);

    console.log("smsurl--------");

    //Old code

    /*var smsurl = 'http://sms.queenmultiservices.in/submitsms.jsp?';
     smsurl += 'user=sathish&key=280559df18XX';
     smsurl += '&senderid=INFOSM&accusage=1';
     smsurl += '&mobile=+91' + to;
     smsurl += '&message=' + encodeURIComponent(message);
     */

    var options = {url: smsurl, include: true};

    console.log("options--------",smsurl);

    curl.request(options, function (err, parts) {


        console.log("parts--------");



        parts = parts.split('\r\n');
        var data = parts.pop()
            , head = parts.pop();
        //res.send(JSON.stringify({ status: 'success', message: data, url: smsurl}, null, 3));
        if (err) {
            console.log("sms unsuccessful");
        }
        else {
            console.log(data,"sms successfully sent");
        }
    });
}

// /***  Queen Recharge API Purpose Only  ***/
//
exports.rechargeResponce = function (request, response) {

    try {

        console.log(request.query, 'Queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
        //  http://test.sash.cash:4001/recharge/rechargeResponse?accountId=12454&txid=45485857878&transStatus=success&amount=10
        var mustparams = ["accountId", "txid", "transStatus", "amount"];
        if (!checkParams(request, response, mustparams)) return;


        function checkParams(req, res, arr) {
            // Make sure each param listed in arr is present in req.query
            var missing_params = [];
            for (var i = 0; i < arr.length; i++) {
                if (!req.query[arr[i]]) {
                    missing_params.push(arr[i]);
                }
            }
            if (missing_params.length == 0) {
                return true;
            }
            else {
                senderror("Invalide format", res);
                return false;
            }
        }

        console.log(request.query)

        var rechargeObj = request.query;

        var WalletUpadte
        // request.query = JSON.stringify(request.query)
        console.log(0, request.query.txid)

        var balace = {
            url: 'http://95.85.7.57:7998/SmsRechargeRequest?Mob=' + config.queenApi.recharge.mob + '&message=Bal+' + config.queenApi.recharge.pin + '&source=API',
            include: true
        };


        curl.request(balace, function (err, parts, data) {
            parts = parts.split('\r\n');


            var result = parts[parts.length - 1]
            console.log(result, "Balanceeee  successss");

            var regex = /(\d+)/g;
            var bal = result.match(regex);



        if (request.query.transStatus == 'success' || request.query.transStatus == 'Success') {

            db.findOne({recharge_id: request.query.accountId}, function (err, rechgData) {

                if (rechgData) {
                    rechgData = rechgData.toJSON()
                    console.log(rechgData)
                    userDB.findOne({_id: rechgData.user}, function (error, findData) {
                        findData = findData.toJSON()
                        console.log(findData)
                        if (findData) {
                            db.update({recharge_id: request.query.accountId}, {
                                $set: {
                                    recharge_status: 'success',
                                    recharge_date:new Date(),
                                    balance:Number(bal[0]),
                                    recharge_txn_id:request.query.txid,
                                    description: 'Your recharge is successful'
                                }
                            }, function (err1, updateData) {
                                if (updateData) {
                                    console.log(findData.mobile, 'mobileNumber', rechargeObj.amount)

                                  //  rechargesms(findData.mobile, "Rs " + rechargeObj.amount + " debited from your Sash.Cash wallet for recharge. Thank you.", response);

                                   // rechargesms(rechgData.recharge_number, "Your friend " + findData.full_name + " has Recharge Rs " + rechargeObj.amount + " to Our Sash.Cash Recharge. Thank you.", response);

                                    /*if (findData.device_type == 'web') {

                                    } else {
                                        Notify.rechargeNotifySuccess(findData.push_token, findData, rechargeObj.amount)
                                        // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
                                    }
*/

                                    response.send('Success')

                                }

                                else {
                                    console.error('err4')
                                    response.send('Update Recharge Status Failed')
                                }
                            })


                        }

                        else {
                            console.error('err2')
                            response.send('Invalide User')
                        }

                    })

                }
                else {
                    console.error('err1')
                    response.end('Invalide Transaction ID')
                    return;
                }
            })

        } else {
            console.log(request.query.accountId, 'accountId')
            db.findOne({recharge_id: request.query.accountId}, function (err, rechgData) {
                console.log(rechgData)
                if (rechgData) {
                    console.error('SUCCES11')
                    rechgData = rechgData.toJSON()
                    console.log(rechgData, 'RechargeUserdataaa')
                    userDB.findOne({_id: rechgData.user}, function (error, findData) {
                        console.log(findData, 'Userdataaa')
                        if (findData) {
                            console.error('SUCCES12')
                            findData = findData.toJSON()

                            console.error('SUCCES13')
                            console.log('wallet', rechargeObj.amount, 'number', parseInt(rechgData.used_wallet))
                            WalletUpadte = parseInt(findData.wallet) + parseInt(rechgData.used_wallet)
                            WalletUpadte1 = findData.wallet + parseInt(rechargeObj.amount)
                            console.log(WalletUpadte, 'wallet1', findData.wallet, 'nosss', parseInt(rechargeObj.amount))

                            db.update({recharge_id: request.query.accountId}, {
                                $set: {
                                    recharge_status: 'failure',
                                    balance:Number(bal[0]),
                                    recharge_date:new Date(),
                                    description: 'We have refunded the amount to your Sash.Cash wallet'
                                }
                            }, function (err1, updateData) {
                                if (updateData) {
                                    console.error('SUCCES14')
                                    userDB.update({_id: rechgData.user}, {$set: {wallet: WalletUpadte}}, function (err2, usrUpdateData) {
                                        if (usrUpdateData) {
                                            console.error('SUCCES15')

                                           // rechargesms(findData.mobile, "Rs " + rechargeObj.amount + " credited from your Sash.Cash account for Last recharge failed. Please Recharge Again.", response);

                                            if (findData.device_type == 'web') {

                                            } else {
                                             //   Notify.rechargeNotifyFailure(findData.push_token, findData, rechargeObj.amount)
                                                // Notify.walletNotify(frnuserdata.push_token,frnuserdata)
                                            }

                                            response.send('Success')
                                        } else {

                                            console.error('err4')
                                            response.send('Update User Wallet Failed')

                                        }
                                    })
                                }
                                else {

                                    console.error('err4')
                                    response.send('Update Recharge Status Failed')

                                }

                            })

                        } else {
                            console.error('err2')
                            response.send('Invalide User')
                        }

                    })

                }
                else {
                    console.error('err1')
                    response.end('Invalide Transaction ID')
                    return;
                }
            })

        }
        /* function rechargesms(to, message, res) {

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

         });
         }*/


    })
    }

    catch (error) {

        json = {
            error: "Error: " + error.message
        };

        return senderror("Exception Occurred", response);
    }

}

 /***  JRI Recharge Response API Purpose Only  ***/

exports.jriRechargeResponse = function (request, response) {

    console.log("recharge response params",request.query)
    console.log("recharge response params",request.body)

    var rechargeObj = JSON.parse(request.query);


           if(rechargeObj.Status == '0 | Recharge Successful'){

           rechargeObj.recharge_status = 'success'
           rechargeObj.description = 'Your recharge is successfull '
           }
           else {
               rechargeObj.recharge_status = 'failure'
               rechargeObj.description = 'Your recharge is failed '

           }



    db.findOne({recharge_id: rechargeObj.SystemReference}).exec(function (error,rechargeData) {

        if(error || !rechargeData){

            var recharge = new db()

            recharge.recharge_number = rechargeObj.Mobile
            recharge.operator = rechargeObj.Provider
            recharge.amount = Number(rechargeObj.Amount)
            recharge.recharge_id = rechargeObj.SystemReference
            recharge.description = rechargeObj.description
            recharge.recharge_status = rechargeObj.recharge_status
            recharge.recharge_txn_id = rechargeObj.OrderNo

            db.create(recharge,function (createErr,createData) {

            })


        }
        else {

            db.update({recharge_id: rechargeObj.SystemReference},{recharge_status :rechargeObj.recharge_status,description:rechargeObj.description},function (UpdateErr,updateData) {

                if(updateData){
                 response.send(true)
                }
                else {
                    response.send(false)
                }

            })


        }


    })



}

///* **********  refund transfer************ */

exports.refundMoney=function(req,res){

    try{

        console.log("Refund method refund_types",req.body)

  userDB.findOne({_id:req.body.user_id},function(Err,userData){
      if(Err){
           senderror("User not found", res);
      } else{
refundDB.findOne({recharge:req.body.recharge_id},function(err,refundData){

            if(err){

                console.log("Refund collections error")
            }
            else {

                console.log("If the recharge id exist you dont have to refund the money else we have to refund")

                if(!refundData){

                    console.log("Find the specific recharge data get those details update in refund collections ")

                    // db.findOne({_id:req.body.recharge_id,payment_status:'success',status:'failed'},function(err,rechargeData){

                    db.findOne({_id:req.body.recharge_id}).populate('payment').exec(function(err,rechargeData){

                        if(err || !rechargeData){

                            console.log("Recharge records not found")

                            senderror("Payment has not been made this id ", res);

                        }
                        else {

                            if(req.body.refund_type == "wallet"){

                                var addToWallet = rechargeData.used_payment;

                                userDB.update({_id:req.body.user_id},{$set:{wallet:addToWallet}},function(err,userData){

                                    if(err || !userData){

                                        console.log("User Not found")
                                    }
                                    else {

                                        var refunds= new refundDB()

                                        refunds['refund_id'] = randomstring.generate({
                                            length: 8,
                                            charset: 'numeric',
                                        })
                                        refunds['user'] = req.body.user_id
                                        refunds['recharge'] = req.body.recharge_id
                                        refunds['refund_type'] = req.body.refund_type
                                        refunds['refund_status'] = "success",
                                        refunds['status'] = "success",
                                        refunds['refund_amount'] = Number(rechargeData.used_payment)
                                        refunds['refund_used_wallet'] = rechargeData.used_wallet
                                        refunds['refund_discount_amount'] = rechargeData.used_discount
                                        refunds['refund_used_payment'] = rechargeData.used_payment
                                        refunds['description'] ="Amount has been refund to Wallet";



                                        refundDB.create(refunds,function(err,refundData){

                                            if(err || !refundData){

                                                console.log("Refund Tranascation is not saved")
                                            }
                                            else {

                                                console.log("Data are comesss")


                                                db.update({_id:req.body.recharge_id},{$set:{refund:refunds._id,refund_status:'success'}},function(err,rechargeData){

                                                    if(err || !rechargeData){

                                                        console.log("Recharge record not found when rechrage refund status is updated");
                                                    }

                                                    else {

                                                        res.send({status:'Success',message:"Amount has been refunded to wallet"})
                                                    }

                                                })

                                            }

                                        })

                                    }

                                })

                            }

                            else {

                                if (req.body.refund_type == "bank") {

                                console.log("Refund  to user bank has to be initiated here", rechargeData.payMapid, rechargeData.user_payable)

                                userDB.update({_id: req.body.user_id}, {$set: {wallet: Number(userData.wallet
                                    +rechargeData.used_wallet)}}, function (err, userData) {

                                    if (err || !userData) {

                                        console.log("User Not found")
                                    }

                                    else {

                                        var amendTxn = new refundDB()

                                        var data = querystring.stringify({
                                            merchantKey: config.payuMoney.key,
                                            paymentId: rechargeData.payment.payment_response[0].payuMoneyId,
                                            refundAmount: rechargeData.used_payment
                                        });


                                        var options = {
                                            hostname: 'www.payumoney.com',
                                            port: 443,
                                            path: config.payuMoney.refundURL + data,
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Content-Length': Buffer.byteLength(data),
                                                'content': data,
                                                'accept': '*/*',
                                                'Authorization': 'Svzkq3HNPZ8Dwdj/MKARwohABUAvcFr6DjfpOSYfYB0='
                                            }
                                        };


                                        var payuReq = http.request(options, function (payuRes) {
                                            payuRes.setEncoding('utf8');

                                            payuRes.on('data', function (chunk) {    // data will be available in callback
                                                console.log("body: ", chunk, typeof(chunk));

                                                var refundObj = JSON.parse(chunk)

                                                console.log("Testing this case ", refundObj.message)

                                                amendTxn['user'] = req.body.user_id
                                                amendTxn['recharge'] = req.body.recharge_id
                                                amendTxn['refund_type'] = req.body.refund_type

                                                amendTxn['refund_amount'] = Number(rechargeData.used_payment)
                                                amendTxn['refund_used_wallet'] = rechargeData.used_wallet
                                                amendTxn['refund_discount_amount'] = rechargeData.used_discount
                                                amendTxn['refund_used_payment'] = rechargeData.used_payment


                                                if (refundObj.status == 0 || refundObj.status == '0') {

                                                    amendTxn['refund_status'] = "pending"
                                                    amendTxn['description'] = refundObj.message;
                                                    amendTxn['refund_id'] = refundObj.result;
                                                }

                                                //We dont need if and  else case directly we can assign the value if the user already raised the refund request  refund wallet amount msg will send
                                                else if (refundObj.status == -1 || refundObj.status == '-1') {

                                                    amendTxn['description'] = refundObj.message;

                                                } else {

                                                    amendTxn['refund_status'] = "success"
                                                    amendTxn['description'] = refundObj.message;

                                                }

                                                amendTxn['refund_response'] = refundObj;

                                                refundDB.create(amendTxn, function (err, refundData) {

                                                    if (err || !refundData) {

                                                        console.log("Refund Tranascation is not saved")
                                                    }
                                                    else {

                                                        db.update({_id: req.body.recharge_id}, {$set: {refund:amendTxn._id,refund_status: 'pending'}}, function (err, rechargeData) {

                                                            if (err || !rechargeData) {

                                                                console.log("Recharge record not found when rechrage refund status is updated");
                                                            }

                                                            else {

                                                                res.send({
                                                                    status: 'success',
                                                                    message: "Your Refund Request has been Initiated"
                                                                })
                                                            }

                                                        })

                                                    }

                                                })


                                            });
                                        });

                                        payuReq.on('error', function (e) {
                                            console.log('Error' + e.message);
                                        });

                                        payuReq.write(data);

                                    }

                                })
                              }
                              else {
                                    senderror("Invalid refund type. Please Try Again ", response);
                                }
                            }

                        }
                    })

                }
                else {

                    console.log("Amount already have been refunded")

                    res.send({status:'failure',msg:"Amount already has been refunded"})
                }
            }
        })

      }
  })

        

    }

    catch(error){
        json = {
            error: "Error: " + error.message
        };
        return senderror(error.message, res);
    }


}

var request = require('request');

var curl = require('curlrequest');

exports.refundMoneyPay=function(req,res){



        console.log("Refund method refund_type",req.body)






                                        var amendTxn={}

                                        var formData = {
                                            merchantKey: config.payuMoney.key,
                                            refundId : req.body.id
                                        };

    var data = querystring.stringify({
        merchantKey: config.payuMoney.key,
        refundId : req.body.id
    });


     var smsurl = "'https://www.payumoney.com/treasury/ext/merchant/getRefundDetails?merchantKey=5W3UXMFX&refundId=3553894' -H 'authorization: KpNTiy57L6OFjS2D3TqPod8+6nfGmRVwVMi5t9jR4NU=' -H 'cache-control: no-cache'"






    var options = {url:smsurl, include: true};

    curl.request(options, function (err, parts, datas) {

        parts = parts.split('\r\n');

        console.log(parts, "successss Messagesss",datas);
        console.log(parts[parts.length - 1], "successss");




    })









    // request.post({url:config.payuMoney.getrefundDetilsURL, formData: formData}, function optionalCallback(err, httpResponse, body) {
    //     if (err) {
    //         return console.error('upload failed:', err);
    //     }
    //     console.log('Upload successful!  Server responded with:', body);
    // });





/*
                                        var options = {
                                            hostname: 'www.payumoney.com',
                                            port: 443,
                                            path: config.payuMoney.getrefundDetilsURL+data,
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Content-Length': Buffer.byteLength(data),
                                                'content': data,
                                                'accept': '*!/!*',
                                                'Authorization': 'Svzkq3HNPZ8Dwdj/MKARwohABUAvcFr6DjfpOSYfYB0='
                                            }
                                        };


                                        var payuReq = http.request(options, function(payuRes) {
                                            payuRes.setEncoding('utf8');

                                            payuRes.on('data', function(chunk) {    // data will be available in callback

                                                console.log("body: " , chunk,typeof(chunk));

                                                var refundObj=JSON.parse(chunk)

                                                console.log("Testing this case ",refundObj)

                                                res.send(refundObj)










                                            });
                                        });

                                        payuReq.on('error',function(e){
                                            console.log('Error'+ e.message);
                                        });

                                        payuReq.write(data);*/






}

function accountHistory(user_id,recharge) {

    console.log('account Historyyyyyyyyyyyyyyyyyy')
    console.log(user_id,'users',recharge,'recharge')

    userDB.findOne({_id:user_id}, function (err, userdoc) {


            var accountHistory = new accountHistoryDB();

            accountHistory.amount =  Number(recharge.amount);
            accountHistory.recharge =  recharge._id;
            accountHistory.type = 'recharge';
            accountHistory.source = 'recharge';
            accountHistory.user    = user_id;
            accountHistory.user_details =userdoc.user_track_details;
            accountHistory.status = 1;
            accountHistory.is_earned = 1;
            accountHistory.updated_at = new Date();
            accountHistory.is_type = 'spend'

            accountHistoryDB.create(accountHistory,function (err,creditData) {

            })



    })

}