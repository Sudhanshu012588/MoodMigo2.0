// utils/chatMemory.js
import mongoose from 'mongoose';
import crypto from 'crypto';
import { config } from 'dotenv';
import ChatHistory from "../Models/ChatHistory.js"
config();

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// MongoDB Schema

// Encryption functions using createCipheriv
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

export function encrypt(text) {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(ENCRYPTION_KEY, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Set additional authenticated data (optional but recommended)
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedData, iv, salt, authTag) {
  try {
    const key = deriveKey(ENCRYPTION_KEY, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    
    // More specific error handling
    if (error.message.includes('Unsupported state')) {
      throw new Error('Decryption failed: Invalid authentication tag or corrupted data');
    } else if (error.message.includes('wrong final block length')) {
      throw new Error('Decryption failed: Corrupted encrypted data');
    } else {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

// Ensure MongoDB connection
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }
}

export const getChatHistory = async (uuid) => {
  try {
    await ensureConnection();
    
    const chatRecord = await ChatHistory.findOne({ uuid });
    
    if (!chatRecord) {
      return [];
    }
    
    // Decrypt the history
    const decryptedHistory = decrypt(
      chatRecord.encryptedHistory,
      chatRecord.iv,
      chatRecord.salt,
      chatRecord.authTag
    );
    
    // Parse the JSON string back to array
    const history = JSON.parse(decryptedHistory);
    
    // Validate that it's an array
    if (!Array.isArray(history)) {
      console.warn(`Invalid history format for UUID: ${uuid}, returning empty array`);
      return [];
    }
    
    return history;
    
  } catch (error) {
    console.error('Error getting chat history from MongoDB:', error);
    
    // Fallback to empty array if decryption fails (corrupted data)
    if (error.message.includes('Decryption failed') || error.message.includes('Failed to decrypt')) {
      console.warn(`Corrupted data for UUID: ${uuid}, deleting record and returning empty array`);
      // Delete the corrupted record
      await ChatHistory.deleteOne({ uuid }).catch(console.error);
    }
    
    return [];
  }
};

export const saveChatHistory = async (uuid, history) => {
  try {
    await ensureConnection();
    
    if (!uuid) {
      throw new Error('UUID is required');
    }
    
    if (!Array.isArray(history)) {
      throw new Error('History must be an array');
    }
    
    // Convert history array to JSON string for encryption
    const historyString = JSON.stringify(history);
    
    // Encrypt the history
    const encryptedData = encrypt(historyString);
    
    // Upsert the record
    await ChatHistory.findOneAndUpdate(
      { uuid },
      {
        encryptedHistory: encryptedData.encrypted,
        iv: encryptedData.iv,
        salt: encryptedData.salt,
        authTag: encryptedData.authTag,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log(`✅ Chat history saved for UUID: ${uuid}`);
    return true;
    
  } catch (error) {
    console.error('Error saving chat history to MongoDB:', error);
    return false;
  }
};

// Utility functions for management
export const deleteChatHistory = async (uuid) => {
  try {
    await ensureConnection();
    const result = await ChatHistory.deleteOne({ uuid });
    console.log(`✅ Chat history deleted for UUID: ${uuid}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
};

export const getAllChatUUIDs = async () => {
  try {
    await ensureConnection();
    const records = await ChatHistory.find({}, 'uuid createdAt updatedAt').sort({ updatedAt: -1 });
    return records.map(record => ({
      uuid: record.uuid,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching chat UUIDs:', error);
    return [];
  }
};
// Get chat history stats
export const getChatStats = async () => {
  try {
    await ensureConnection();
    const totalChats = await ChatHistory.countDocuments();
    const recentChats = await ChatHistory.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    return {
      totalChats,
      recentChats,
      storageDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting chat stats:', error);
    return null;
  }
};

// Close MongoDB connection (for graceful shutdown)
export const closeConnection = async () => {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// Handle application termination
process.on('SIGINT', async () => {
  console.log('🔄 Closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing MongoDB connection...');
  await closeConnection();
  process.exit(0);
});