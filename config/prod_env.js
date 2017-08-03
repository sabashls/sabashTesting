/**
 * Created by sabash ls on 15/02/17.
 */



var config = {
    name: 'SashCash User API',
    version: '0.0.1',
    enableConsole: true,
    config_file:'Production envorinment',
    database: {
        host: '10.1.11.190',
        port: '37017',
        db: 'sashcash',
        username: '',
        password: ''
    },

   dbURI:'mongodb://10.1.11.190:37017/sashcash',

    http: {
        host: "0.0.0.0",
        enabled: true,
        port: 4003
    },
    profileUploadUrl: {

        url:'public/profileimage/'

    },
    crypto:{
        algorithm : 'aes-256-ctr',
        key : 'sash.cash'
    },
    https: {
        enabled: false,
        port: 443,
        options: {
            key: '',
            cert: '',
            ca: '',
        }
    },
    session: {
        store: 'redis',
        host: 'localhost',
        port: '6379'
    },
    nexmo: {
        from: ''
    },
    nodemailer: {
        username: 'noreply@sash.cash',
        password: 'sash@cash123',
        from: ''
    },
    fileUploadUrl :'http://0.0.0.0:4000/',

    cyrusApi:{
        rechargeUrl : "http://205.147.96.60/api/recharge.aspx?",
        memberId : "AP3375854", // 1. Dev : AP3375854  2. Prod : AP337564
        pin : "8867826651"      // 1. Dev : 8867826651      2. Prod : 8867826619
    },

    jriApi:{
        loginUrl:'https://api.justrechargeit.com/JRICorporateLogin.svc/secure/securelogin',
        rechargeUrl:'https://api.justrechargeit.com/JRICorporateRecharge.svc/secure/recharge',
        specialRechargeUrl:'https://api.justrechargeit.com/JRICorporateRecharge.svc/secure/specialrecharge',
        rechargeStatusUrl:'https://api.justrechargeit.com/JRICorporateRechargeStatus.svc/secure/APIRechargeStatus',
        rechargePlanUrl:'http://api.justrechargeit.com/JRI_API_PopularRecharges.svc/GetPopularRechargesGrid',
        SecurityKey:'S212360',
        EmailId:"recharge@sash.cash",
        Password:"Digita",
        loginAPIChkSum:"225a18977eb3c0c3a747dc8ed1128cbb",
        checkSum_key:'SC@M12',
        identity :'justRechargeIt'
    },

    payuMoney:{

        key:'5W3UXMFX',
        merchantId : "5527018",
        Salt:'jVPgEPE0Fa',
        service_provider:'payu_paisa',
        productinfo:"sash_cash_test",
        surl:'http://api.sash.cash/payment/response',
        furl:'http://api.sash.cash/payment/response',
        /*surl:'http://20.0.0.24:4003/api/v1/android/rechargePayment',
         furl:'http://20.0.0.24:4003/api/v1/android/rechargePayment',*/
        refundURL:'https://www.payumoney.com/payment/merchant/refundPayment?',
        getrefundDetilsURL:'https://www.payumoney.com/treasury/ext/merchant/getRefundDetails?',
        redirectURL:'http://sash.cash/user/#/rechargeSummary/'
    },


    //Queen API Configurations

    queenApi : {
        sms : {
            smsUrl : 'http://sms.queenmultiservices.in/submitsms.jsp?',
            user:'sathish',
            key:'280559df18XX',
            senderId: 'INFOSM',  //1. Dev : INFOSM      2. Prod : SACASH
            mobile: '+91',

        },

        recharge : {
            rechargeUrl : "http://95.85.7.57:7998/SmsRechargeRequest?",
            mob : "9171666444",

            // mob : "9171666444",
            // 1. Dev : 9043033456  2. Prod : 9171666444
            pin : "9827"      // 1. Dev : 333456      2. Prod : 9827
        },
        identity:'queenRecharge',
    },


    paytm:{
        merchantKey:"g#7ilvF37IPYWt#x",
        merchantGuid:"cefaf68a-217b-448a-8538-d1bbd73beb5f",
        salesWalletGuid:"fc132872-3516-4703-8042-c1646410b343",
        platformName:"PayTM",
    },

    completeEmailUrl:'http://sash.cash:8001/campaigns/completeCampaignEmail',
    sendMail : {
        url : "http://sash.cash/mail/sendmail.php?"
    },
    pushNotify :{
        serverKey : 'AIzaSyDsEb63jGMtCLS70Il6sZxfofI7Z8DzIFY'
    },

    projection:{wallet:1,blocked:1,verified:1,image:1,email:1,mobile:1,referral_code:1,full_name:1,gender:1,profession:1,dob:1,state:1,town:1,city:1,age:1,_id:1},


    notificationList:['video','poster','link','appdownload','audio','general'],

    alerts :['9840773136', '9841613363','8015816810'],



};

module.exports = config;