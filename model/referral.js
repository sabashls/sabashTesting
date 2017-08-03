/**
 * Created by sabash ls on 25/11/16. *
 **/
var mongoose = require('mongoose');

var ReferralSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        status: Number,
        type: String,
        referral_code:String,



        referred_by : [{user:{
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
            user_details:{
                type: mongoose.Schema.ObjectId,
                ref: 'users_tracking',
            },
            reffered_date : {type: Date, default: Date.now},

}],

        referral_user:  [{
            user:{
                      type: mongoose.Schema.ObjectId,
                     ref: 'users',
             },
            user_details:{
                     type: mongoose.Schema.ObjectId,
                    ref: 'users_tracking',
             },
            refferel_date : {type: Date},
            amount: Number,

        }],
        total_amount: Number,
        updated_at: {type: Date, default: Date.now},
    },
    {collection: 'referrals'}
);

module.exports = mongoose.model('referrals', ReferralSchema);
