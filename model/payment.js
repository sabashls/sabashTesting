/**
 * Created by Sabash ls on 04/02/17.
 */

var mongoose = require('mongoose');

var PaymentsSchema = new mongoose.Schema({

        recharge: {
            type: mongoose.Schema.ObjectId,
            ref: 'recharges',
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        refund: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        type: String,
        amount: String,
        message: String,
        portal: String,
        txn_id: String,
        transaction_id: String,
        transaction_details: String,
        payment_status:String,
        payment_response :Array,
        updated_at: { type: Date, default: Date.now },
        created_at: { type: Date, default: Date.now },

        is_active:{type: Number, default: 0},
        is_block:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_used:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
    },
    {collection: 'user_payments'}
);

module.exports = mongoose.model('user_payments', PaymentsSchema);
