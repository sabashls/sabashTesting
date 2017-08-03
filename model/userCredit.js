/**
 * Created by sashcash on 2/14/17.
 */
var mongoose = require('mongoose');

var user_Credit_Schema = new mongoose.Schema({
        amount : Number,
        type : String,
        source:String,
        campaign:{type: mongoose.Schema.ObjectId,
            ref: 'campaigns'},
        referral:{type: mongoose.Schema.ObjectId,
            ref: 'referrals'},
        transfer:{type: mongoose.Schema.ObjectId,
            ref: 'transfers'},
        updated_at: {type: Date, default: Date.now},
        credit_date: {type: Date, default: Date.now},
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        },
        user_details: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking'
        }
    },
    {collection: 'users_credit'}
);
module.exports = mongoose.model('users_credit', user_Credit_Schema);
