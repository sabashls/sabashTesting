var mongoose=require('mongoose')

var campaignNotfy=new mongoose.Schema({

    campaign_title:String,

    campaign_description:String,

    campaign_id:{
        type:mongoose.Schema.ObjectId,
        ref:'campaigns'
    },

    campaign_type:String,

    imageurl:String,

    campaign_imageurl:String,

    campaign_link:String,

    updated_at:{type: Date, default: Date.now},

    notify_at:{type: Date, default: Date.now},

    notification_status:[String],

    notification_platform:[String]
})