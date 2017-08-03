/**
 * Created by sabash ls on 01/11/16. *
 **/
var mongoose = require('mongoose');

var TransferSchema = new mongoose.Schema({
        sender_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        sender_details: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking',
        },
        order_id: String,
        status: String,
        message: String,
        response: Array,
        type: String,
        transfer_id : String,
        sender_mobile : String,
        sender_email : String,
        sender_name : String,
        recipient_mobile : String,
        recipient_email : String,
        recipient_name : String,
        recipient: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
        },
        recipient_details: {
            type: mongoose.Schema.ObjectId,
            ref: 'users_tracking',
        },
        amount: Number,
        updated_at: {type: Date, default: Date.now},
    },
    {collection: 'transfers'}
);

module.exports = mongoose.model('transfers', TransferSchema);
