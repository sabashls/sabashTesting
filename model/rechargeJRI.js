/**
 * Created by raaam ls on 04/02/17.
 */
var mongoose = require('mongoose');

var jriRechargesSchema = new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        status: String,
        email: String,
        mobile: String,
        type: String,
        service: String,
        customer: String,
        amount: String,
        orderNo: String,
        reason:String,
        description: String,
        transactionRef:String,
        systemReference:String,
        updated_at: {type: Date, default: Date.now},
    },
    {collection: 'jrirecharges'}
);

module.exports = mongoose.model('jrirecharges', jriRechargesSchema);