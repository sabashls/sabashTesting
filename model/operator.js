/**
 * Created by sabash on 12/5/17.
 */

var mongoose = require('mongoose');

var operatorSchema = new mongoose.Schema({
        operator: String,
        jri_key: String,
        queen_key: String,
        is_special:Number ,
        minimum:Number,
        type: String,
        max_length :Number,
        updated_at: {type: Date, default: Date.now},
        is_active:{type: Number, default: 0},
        is_block:{type: Number, default: 0},
        is_check:{type: Number, default: 0},
        is_valide:{type: Number, default: 0},
        is_true:{type: Number, default: 0},
        is_false:{type: Number, default: 0},
        is_verify:{type: Number, default: 0},
    },
    {collection: 'operators'}
);

module.exports = mongoose.model('operators', operatorSchema);