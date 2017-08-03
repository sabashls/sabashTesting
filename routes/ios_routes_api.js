    var app = require('../android_api');

    var user = require('../services/user/user');





    app.post('/users/userLogin',user.login);             // User Login API

    app.post('/users/checkAccount',user.checkAccount);  // Check User Account API

    app.post('/users',user.signup);                    // User Singnup API

    app.post('/stateList', user.stateList);           // To Load the StateList API

    app.post('/cityList',user.cityList);             // To Load the CityList API

    app.post('/townList',user.townList);             // To Load the TownList API

    app.get('/users/:id',user.specificUser);         // To Load the Specific user Details API

    app.get('/userWallet/:id',user.userWallet);      //To  Load the Specific User Wallet Details API

    app.post('/users/forgotPassword',user.forgotPassword);

    app.post('/users/changePassword',user.changePassword);

    app.post('/users/verification',user.verification);

    app.post('/users/resend',user.resend);

    app.post('/users/accountHistory',user.accountHistory);

    app.post('/users/allAccountHistory',user.allAccountHistory);

    app.post('/users/logout/:id',user.logout);

    app.put('/users/:id',user.update);   //pending

    app.post('/users/referralHistory',user.referralHistory);

    app.post('/operatorList',user.getOperatorList);

    app.post('/professionList',user.professionList);

    app.post('/users/updateFacebook',user.updateFacebook);

    app.post('/keygenerator/:id',user.keygenerator);

    app.post('/users/updateUserImage',user.profileImage);

    app.post('/users/mailCom',user.mailCom)


    app.post('/users/socialLogin',user.socialLogin);
