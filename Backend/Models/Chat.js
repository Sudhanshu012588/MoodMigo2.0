// models/Chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  uuid:{
    type:String,
    require:true
  },
  ChatName:{
    type:String,
    require:true
  },
  Personality:{
    type:String,
    require:true
  },
  Mood:{
    type:String,
    require:true
  },
  Context:{
    type:String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster queries
ChatSchema.index({ userId: 1, createdAt: -1 });

// Update updatedAt before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Chat", ChatSchema);