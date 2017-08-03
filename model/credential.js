/**
 * Created by Sabash ls on 09/5/17.
 */


var mongoose=require('mongoose')

var credentialsSchema= new mongoose.Schema({
    /**** JRI Genral Fileds ****/

    corporateId:Number,
    password:String,
    auth_key:String,
    identity:String,
    /**** Genral Fileds ****/
    type:String,
    balance:Number,
    min_limit:Number,
    key:String,
    provider:String,
    /**** Date Fileds ****/
    updated_at: {type: Date, default: Date.now},
    created_date: {type: Date},
    verified_date: {type: Date},
    /**** Extra Fileds ****/
    is_active:{type: Number, default: 0},
    is_block:{type: Number, default: 0},
    is_check:{type: Number, default: 0},
    is_valide:{type: Number, default: 0},
    is_true:{type: Number, default: 0},
    is_false:{type: Number, default: 0},
    is_verify:{type: Number, default: 0},

})

module.exports=mongoose.model('credentials',credentialsSchema)