// models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  messagePair: {
    userMessage: {
      encryptedData: {
        iv: { type: String, required: true },
        data: { type: String, required: true },
        authTag: { type: String, required: true },
        version: { type: String, default: '1.0' }
      }
    },
    aiResponse: {
      encryptedData: {
        iv: { type: String, required: true },
        data: { type: String, required: true },
        authTag: { type: String, required: true },
        version: { type: String, default: '1.0' }
      }
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
MessageSchema.index({ chatId: 1, timestamp: 1 });

export default mongoose.model("Message", MessageSchema);