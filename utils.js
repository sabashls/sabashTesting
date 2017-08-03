var User = require('./model/user');

var validateIllegalUser = function (userid) {
    console.log(userid)
    return User.findById(userid)
        .then((userdoc) => {
           var data = userdoc.toJSON();
           console.log(data)
            if ((data.blocked == '1') || (data.blocked == 1)) {
                return Promise.resolve(JSON.stringify({
                    status: 'blocked',
                    message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                }));
            } else if ((data.verified == '0') || (data.verified == 0)) {
                return Promise.resolve(JSON.stringify({ status: 'verify', data: { result: data._id } }));
            } else {
                return Promise.resolve({"message": "success"});
            }
        });
}


var someMethod = function (userid) {
    console.log(userid)
    return User.findById(userid)
        .then((userdoc) => {
           var data = userdoc.toJSON();
           console.log(data)
            if ((data.blocked == '1') || (data.blocked == 1)) {
                return Promise.resolve(JSON.stringify({
                    status: 'blocked',
                    message: 'Your account is blocked, Please contact Sash.Cash support team for further details'
                }));
            } else if ((data.verified == '0') || (data.verified == 0)) {
                return Promise.resolve(JSON.stringify({ status: 'verify', data: { result: data._id } }));
            } else {
                return Promise.resolve({"message": "success"});
            }
        });
}


module.exports = {
    validateIllegalUser : validateIllegalUser,
    someMethod: someMethod
}