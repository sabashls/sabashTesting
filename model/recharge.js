/**
 * Created by sabash ls on 01/11/16.
 */

var mongoose=require('mongoose')

var rechargeSchema = new mongoose.Schema({

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },


        circle: String,
        used_wallet: String,
        used_discount: String,
        payment_type: String,
        recharge_type: String,
        location_key: String,
        used_payment: String,
        location_name: String,
        plan_type: String,
        payment_status: String,
        payment_id: String,
        plan_select: String,
        amount:Number,
        balance:Number,              // portal recharge balance
        portal:String,              //Which portal recharged Queen || JRI
        description: String,
        is_payment:Number,          // 0/1 payment through bank or sashcash
        order_no:String,
        operator:String,
        operator_type:String,       //special/Topup/
        payment_mode:String,            //wallet/bank/wb
        plan_type:String,           //prepaid/postpaid
        ptxn_id:String,
        payment_status:String,
        recharge_txn_id:String,          //Recharge transcation id
        recharge_id:String,          //Recharge transcation id
        recharge_type:String,       //dth/mobile
        recharge_number:String,
        recharge_status:String,

       /* refund_type:String,        //Wallet/payment
        refund_status:String,
        refund_date_req:{type: Date, default: Date.now},
        refunded_date:String,*/
        serviceProvider:String,
        transactionRef:String,
        used_wallet:Number,          //how much spend from wallet
        used_payment:Number,          //spend from cc/dc/netbanking
        used_discount:Number,
        updated_at:{type: Date, default: Date.now},
        recharge_date:{type: Date},

        paymentMode:String,
        error_Message:String,
        paymentId:String,
        productInfo:String,
        customerEmail:String,
        customerPhone:Number,
        merchantTransactionId:String,
        amount:Number,
        notificationId:String,
        payment_status:String,
        refund_status:String,

        refund: {
            type: mongoose.Schema.ObjectId,
            ref: 'refunds',
        },

        payment: {
            type: mongoose.Schema.ObjectId,
            ref: 'user_payments',
        },

    },

    {collection: 'recharges'}
)

module.exports = mongoose.model('recharges', rechargeSchema);










/*
 var mongoose = require('mongoose');

 var RechargesSchema = new mongoose.Schema({
 user_id: {
 type: mongoose.Schema.ObjectId,
 ref: 'users',
 },

 status: String,
 email: String,
 mobile: String,
 type: String,
 service: String,
 operator: String,
 customer: String,
 amount: Number,
 recharge_id: String,
 description: String,
 transactionRef:String,
 systemReference:String,
 serviceProvider:String,
 recharge_mode:String,
 updated_at: {type: Date, default: Date.now},
 },
 {collection: 'recharges'}
 );

 module.exports = mongoose.model('recharges', RechargesSchema);*/
