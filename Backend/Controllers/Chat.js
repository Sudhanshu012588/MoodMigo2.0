import Chat from "../Models/Chat.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import crypto from 'crypto';
import 'dotenv/config';

// Initialize LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY
});

// Modern encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

const getEncryptionKey = () => {
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters) for AES-256');
  }
  return keyBuffer;
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class ModernEncryptionService {
  static encrypt(text) {
    try {
      const key = getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Invalid authentication tag length');
      }
      
      return {
        iv: iv.toString('hex'),
        data: encrypted,
        authTag: authTag.toString('hex'),
        version: '1.0'
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  static decrypt(encryptedData) {
    try {
      const key = getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      
      if (iv.length !== IV_LENGTH) {
        throw new Error('Invalid IV length');
      }
      
      if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Invalid authentication tag length');
      }
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }
}

// Enhanced memory service with array storage
class SecureMemoryService {
  constructor() {
    this.conversationCache = new Map();
  }

  async saveMessagePair(chatId, userMessage, aiResponse) {
    try {
      // Encrypt both messages
      const encryptedUserMessage = ModernEncryptionService.encrypt(userMessage);
      const encryptedAIResponse = ModernEncryptionService.encrypt(aiResponse);
      
      // Add to messages array in the Chat document
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {
            messages: {
              userMessage: { encryptedData: encryptedUserMessage },
              aiResponse: { encryptedData: encryptedAIResponse }
            }
          },
          $set: { updatedAt: new Date() }
        },
        { new: true }
      );

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Update cache
      const newPair = {
        id: chat.messages[chat.messages.length - 1]._id.toString(),
        userMessage,
        aiResponse,
        timestamp: new Date()
      };

      if (!this.conversationCache.has(chatId)) {
        this.conversationCache.set(chatId, []);
      }
      const cachedPairs = this.conversationCache.get(chatId);
      cachedPairs.push(newPair);

      // Keep only last 20 pairs in cache
      if (cachedPairs.length > 20) {
        this.conversationCache.set(chatId, cachedPairs.slice(-20));
      }

      return newPair;
    } catch (error) {
      console.error("Error saving message pair:", error);
      throw error;
    }
  }

  async getMessagePairs(chatId, limit = 50) {
    try {
      // Try cache first
      const cachedPairs = this.conversationCache.get(chatId);
      if (cachedPairs && cachedPairs.length > 0) {
        return cachedPairs.slice(-limit);
      }

      // Get from database and decrypt
      const chat = await Chat.findById(chatId)
        .select('messages')
        .lean();

      if (!chat || !chat.messages) {
        return [];
      }

      // Decrypt all message pairs
      const decryptedPairs = await Promise.all(
        chat.messages.slice(-limit).map(async (msg) => {
          try {
            const userMessage = ModernEncryptionService.decrypt(msg.userMessage.encryptedData);
            const aiResponse = ModernEncryptionService.decrypt(msg.aiResponse.encryptedData);
            
            return {
              id: msg._id.toString(),
              userMessage,
              aiResponse,
              timestamp: msg.userMessage.timestamp
            };
          } catch (decryptError) {
            console.error(`Failed to decrypt message pair ${msg._id}:`, decryptError);
            return {
              id: msg._id.toString(),
              userMessage: "[Encrypted - decryption failed]",
              aiResponse: "[Encrypted - decryption failed]",
              timestamp: msg.userMessage.timestamp
            };
          }
        })
      );

      // Update cache
      this.conversationCache.set(chatId, decryptedPairs);

      return decryptedPairs;
    } catch (error) {
      console.error("Error getting message pairs:", error);
      return [];
    }
  }

  async getConversationContext(chatId, maxPairs = 10) {
    try {
      const messagePairs = await this.getMessagePairs(chatId, maxPairs * 2);
      
      // Convert to LangChain message format for AI context
      const contextMessages = [];
      
      messagePairs.forEach(pair => {
        contextMessages.push(new HumanMessage(pair.userMessage));
        contextMessages.push(new AIMessage(pair.aiResponse));
      });

      //console.log(`Built context with ${contextMessages.length} messages from ${messagePairs.length} pairs`);
      
      return contextMessages;
    } catch (error) {
      console.error("Error building conversation context:", error);
      return [];
    }
  }

  async countMessagePairs(chatId) {
    try {
      const chat = await Chat.findById(chatId).select('messages');
      return chat?.messages?.length || 0;
    } catch (error) {
      console.error("Error counting message pairs:", error);
      return 0;
    }
  }

  async deleteChatMessages(chatId) {
    try {
      // Clear messages array
      await Chat.findByIdAndUpdate(
        chatId,
        { 
          $set: { messages: [] },
          $set: { updatedAt: new Date() }
        }
      );
      
      // Clear cache
      this.conversationCache.delete(chatId);
    } catch (error) {
      console.error("Error deleting chat messages:", error);
      throw error;
    }
  }
}

const secureMemoryService = new SecureMemoryService();

// Create the LangGraph workflow
const callModel = async (state) => {
  try {
    const response = await llm.invoke(state.messages);
    return { messages: [response] };
  } catch (error) {
    console.error("Error calling model:", error);
    throw new Error("Failed to get AI response");
  }
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

// ✅ Create a new chat
export const createChat = async (req, res) => {
  try {
    const { userId, title, personality, mood, context } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ 
        status: "failed",
        message: "User ID and title are required" 
      });
    }

    const chat = new Chat({ 
      userId, 
      title, 
      personality: personality || "Supportive Listener", 
      mood: mood || "Calm", 
      context: context || "",
      messages: [] // Initialize empty messages array
    });
    
    await chat.save();
    
    res.status(201).json({
      status: "success",
      message: "Chat created successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        personality: chat.personality,
        mood: chat.mood,
        context: chat.context,
        messageCount: 0,
        createdAt: chat.createdAt
      }
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to create chat" 
    });
  }
};

// ✅ Send a message to chatbot
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        status: "failed",
        message: "Chat ID and message are required"
      });
    }

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        status: "failed",
        message: "Chat not found"
      });
    }

    // 1. Build conversation context from previous messages
    const history = await secureMemoryService.getConversationContext(chatId, 10);
    
    // 2. Prepare system prompt with chat configuration
    const systemPrompt = new HumanMessage(`
      You are manarah a ${chat.personality} in a ${chat.mood} mood. 
      Here is your chat history with the user ${history}
      ${chat.context ? `Context: ${chat.context}` : 'Have a general supportive conversation.'}
      Respond naturally and helpfully to the user's message
        Note:  don't go  out of context while chatting and don't make the user feel like you are a chat bot or an AI evolve with the user note his/her likes and not likes make chat more engaging.
      .
    `);

    // 3. Prepare user message
    const userMessage = new HumanMessage(message);

    // 4. Combine all messages (system prompt + history + current message)
    const messages = [systemPrompt, ...history, userMessage];

    // 5. Get AI response using LangGraph
    const config = { configurable: { thread_id: chatId } };
    const output = await app.invoke({ messages }, config);
    
    const aiResponse = output.messages[output.messages.length - 1].content;

    // 6. Save encrypted message pair to database
    await secureMemoryService.saveMessagePair(chatId, message, aiResponse);

    // 7. Return the response
    res.json({ 
      status: "success",
      message: "Message sent successfully",
      response: aiResponse,
      chatId: chatId
    });

  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error.message.includes("API key")) {
      return res.status(500).json({
        status: "failed",
        message: "AI service configuration error"
      });
    }
    
    if (error.message.includes("Failed to encrypt") || error.message.includes("Failed to decrypt")) {
      return res.status(500).json({
        status: "failed",
        message: "Encryption service error"
      });
    }
    
    res.status(500).json({
      status: "failed",
      message: "Failed to send message"
    });
  }
};

// ✅ Get all user chats
export const getChats = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(400).json({ 
        status: "failed",
        message: "User ID is required" 
      });
    }

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title personality mood context createdAt updatedAt")
      .lean();
    
    if(!chats){
      return res.status(200).json({
        status:"Success",
        message:"No previous chat"
      })
    }

    const total = await Chat.countDocuments({ userId });

    // Add message counts
    const chatsWithCounts = chats.map(chat => ({
      ...chat,
      messageCount: chat.messages ? chat.messages.length : 0
    }));

    res.json({
      status: "success",
      message: "Chats loaded successfully",
      chats: chatsWithCounts,
      pagination: {
        page,
        limit,
        total,
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    console.error("Error loading chats:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to load chats" 
    });
  }
};

// ✅ Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        status: "failed",
        message: "Chat not found" 
      });
    }

    const messagePairs = await secureMemoryService.getMessagePairs(chatId, limit);

    res.json({
      status: "success",
      message: "Messages loaded successfully",
      messages: messagePairs
    });
  } catch (err) {
    console.error("Error loading chat messages:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to load chat messages" 
    });
  }
};

// Other controller methods (updateChat, deleteChat) remain similar but use the new service

// ✅ Update chat configuration
export const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title, personality, mood, context } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { 
        title, 
        personality, 
        mood, 
        context,
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({ 
        status: "failed",
        message: "Chat not found" 
      });
    }

    res.json({
      status: "success",
      message: "Chat updated successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        personality: chat.personality,
        mood: chat.mood,
        context: chat.context,
        messageCount: chat.messages ? chat.messages.length : 0,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to update chat" 
    });
  }
};

// ✅ Delete chat (with message cleanup)
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        status: "failed",
        message: "Chat not found" 
      });
    }

    // Remove from cache
    secureMemoryService.conversationCache.delete(chatId);

    res.json({ 
      status: "success",
      message: "Chat and all messages deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to delete chat" 
    });
  }
};

// ✅ Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    // Test encryption
    const testMessage = "health-check";
    const encrypted = ModernEncryptionService.encrypt(testMessage);
    const decrypted = ModernEncryptionService.decrypt(encrypted);
    
    // Test database
    const dbTest = await Chat.findOne().limit(1);
    
    res.json({
      status: "success",
      message: "Service is healthy",
      encryption: decrypted === testMessage,
      database: !!dbTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// ✅ Clear chat messages (keep chat, remove messages only)
export const clearChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { 
        $set: { 
          messages: [],
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ 
        status: "failed",
        message: "Chat not found" 
      });
    }

    // Clear cache
    secureMemoryService.conversationCache.delete(chatId);

    res.json({ 
      status: "success",
      message: "Chat messages cleared successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        messageCount: 0,
        updatedAt: chat.updatedAt
      }
    });
  } catch (err) {
    console.error("Error clearing chat messages:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to clear chat messages" 
    });
  }
};

// ✅ Get single chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .select("title personality mood context createdAt updatedAt")
      .lean();

    if (!chat) {
      return res.status(404).json({ 
        status: "failed",
        message: "Chat not found" 
      });
    }

    // Add message count
    const chatWithCount = {
      ...chat,
      messageCount: chat.messages ? chat.messages.length : 0
    };

    res.json({
      status: "success",
      message: "Chat loaded successfully",
      chat: chatWithCount
    });
  } catch (err) {
    console.error("Error loading chat:", err);
    res.status(500).json({ 
      status: "failed",
      message: "Failed to load chat" 
    });
  }
};