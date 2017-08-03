/**
 * Created by Sabash on 12/05/17.
 */



var mongoose = require('mongoose');

var refundSchema = new mongoose.Schema({

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },

        recharge:{
            type: mongoose.Schema.ObjectId,
            ref: 'recharges'
        },

        status:String,                        // Refund payment status
        refund_type:String,                  //Wallet/bank
        refund_status:String,               //successfully refunded or failed
        refund_amount:Number,
        description:String,
        refund_used_wallet:Number,          //0 yes  //1 no
        refund_discount_amount:Number,
        refund_used_payment:Number,
        refund_id:String,
        refund_date_req: {type: Date, default: Date.now},
        updated_at: {type: Date, default: Date.now},
        refunded_date:Date,
        refund_response:Array,
        check_response:Array,

    },
    {collection: 'refunds'}
);

module.exports = mongoose.model('refunds', refundSchema);
