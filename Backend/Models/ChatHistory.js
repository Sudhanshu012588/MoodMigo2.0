import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  encryptedHistory: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  authTag: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // Optional: Auto-delete after 30 days
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create model
export default  mongoose.model('ChatHistory', chatHistorySchema);
