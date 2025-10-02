import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    creatorId:{
        type:String,
        require:true
    },
    tittle:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true
    },
    tags:{
        type:[String]
    },
    Featured_Image:{
        type:String
    },
    likes:{
        type:Number,
        default:0
    },
    heart:{
        type:Number,
        default:0
    }
},{
    timestamps:true,
    collection:"Blogs"
});

const Blogs = mongoose.model("Blogs",BlogSchema)

export default Blogs