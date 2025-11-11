import mongoose from "mongoose";

const cacheSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    BlogContributions:{
        type:Number,
        default:0
    },
    premium:{
        type:Boolean,
        default:false,
    },
    NumberOfChats:{
        type:Number,
        default:0,
    },
    premiumDuration:{
        type:Number,   //x months
        default:0
    },
    premiumExpiry:{
        type:String
    },
    NumberOfquestionare:{
        type:Number,
        default:0
    }
},{
    timestamps:true,
    collection:"cache"
})

const cache  = mongoose.model("cache",cacheSchema)

export default cache;