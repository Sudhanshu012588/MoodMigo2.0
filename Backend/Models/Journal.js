import mongoose from "mongoose"

const journalSchema = new mongoose.Schema({
    userId:{
        type:String,
        require:true
    },
    Date:{
        default:Date.now(),
        type:String,
        require:true
    },
    mood:{
        type:String,
        require:true
    },
    thoughts:{
        type:String,
        required:true
    }
},{
    Collection:"journal",
    timestamps:true
});

const journal = mongoose.model("journal",journalSchema)

export default journal;