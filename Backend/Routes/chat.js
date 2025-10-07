// routes/chatRoutes.js
import express from 'express';
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  sendMessage,
  getChatMessages,
  clearChatMessages,
  healthCheck
} from '../Controllers/Chat.js';

const chatrouter = express.Router();

// Health check
chatrouter.get('/health', healthCheck);

// Chat management
chatrouter.post('/', createChat);
chatrouter.get('/', getChats);
chatrouter.get('/:chatId', getChatById);
chatrouter.put('/:chatId', updateChat);
chatrouter.delete('/:chatId', deleteChat);

// Messages
chatrouter.post('/messages/:chatId', sendMessage);
chatrouter.get('/:chatId/messages', getChatMessages);
chatrouter.delete('/:chatId/messages', clearChatMessages);

export default chatrouter;


