/**
 * Created by sabash ls on 01/11/16.
 */
var mongoose = require('mongoose');

var MastersSchema = new mongoose.Schema({
        type: String,
        attribute_label: String,
        attribute: String,
        attribute_max_value: String,
        value: String,
        commission: String,
        width: String,
        height: String,
        max_size: String,
        min_size: String,
        duration: String,
        tax: { type: String, default: "15"},
        net_value: String,
        updated_at: { type: Date, default: Date.now },
    },
    {collection: 'masters'}
);

module.exports = mongoose.model('masters', MastersSchema);