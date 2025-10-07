// models/Chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    default: "Supportive Listener"
  },
  mood: {
    type: String,
    default: "Calm"
  },
  context: {
    type: String,
    default: ""
  },
  // Store all message pairs in an array within the same document
  messages: [{
    userMessage: {
      encryptedData: {
        iv: { type: String, required: true },
        data: { type: String, required: true },
        authTag: { type: String, required: true },
        version: { type: String, default: '1.0' }
      },
      timestamp: { type: Date, default: Date.now }
    },
    aiResponse: {
      encryptedData: {
        iv: { type: String, required: true },
        data: { type: String, required: true },
        authTag: { type: String, required: true },
        version: { type: String, default: '1.0' }
      },
      timestamp: { type: Date, default: Date.now }
    }
  }],
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
ChatSchema.index({ "messages.timestamp": 1 });

// Update updatedAt before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Chat", ChatSchema);