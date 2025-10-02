import mongoose from "mongoose";
const { Schema, model } = mongoose;

const BlogAccountSchema = new mongoose.Schema({
    userId:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true
    },
    bio:{
        type:String,
    },
    blogs:{
        type:[Schema.Types.ObjectId],
        ref:"Blogs"
    },
    ProfilePicture:{
        type:String
    },
    followers:{
        type:Number,
        default:0
    }
},{
    timestamps:true,
    collection:"BlogAccount"
})

const BlogAccount = mongoose.model("BlogAccount",BlogAccountSchema)
export default BlogAccount
