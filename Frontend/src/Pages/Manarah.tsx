import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Send, Menu, X, MessageCircle, Edit2, Save, Trash2, Moon, Sun, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { account } from "../Appwrite/config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from 'react-markdown';

// Types
interface MessagePair {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  personality: string;
  mood: string;
  context: string;
  messagePairs: MessagePair[];
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NewChatData {
  title: string;
  personality: string;
  mood: string;
  context: string;
}

interface ThemeClasses {
  bg: string;
  text: string;
  card: string;
  input: string;
  button: string;
  sidebar: string;
  messageUser: string;
  messageAI: string;
  border: string;
}

// Modal Component
function Modal({ 
  title, 
  children, 
  onClose, 
  theme 
}: { 
  title: string; 
  children: React.ReactNode; 
  onClose: () => void; 
  theme: ThemeClasses;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md rounded-2xl shadow-xl ${theme.card} ${theme.border} border`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Chat Form Component
function ChatForm({ 
  newChatData, 
  setNewChatData, 
  personalityOptions, 
  moodOptions, 
  onSubmit, 
  onCancel,
  theme 
}: { 
  newChatData: NewChatData;
  setNewChatData: (data: NewChatData) => void;
  personalityOptions: string[];
  moodOptions: string[];
  onSubmit: () => void;
  onCancel: () => void;
  theme: ThemeClasses;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Chat Name *</label>
        <input
          type="text"
          value={newChatData.title}
          onChange={(e) => setNewChatData({ ...newChatData, title: e.target.value })}
          placeholder="Give your chat a name..."
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Personality</label>
        <select
          value={newChatData.personality}
          onChange={(e) => setNewChatData({ ...newChatData, personality: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        >
          {personalityOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mood</label>
        <select
          value={newChatData.mood}
          onChange={(e) => setNewChatData({ ...newChatData, mood: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        >
          {moodOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Context (Optional)</label>
        <textarea
          value={newChatData.context}
          onChange={(e) => setNewChatData({ ...newChatData, context: e.target.value })}
          placeholder="Any specific context for this conversation..."
          rows={3}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Create Chat
        </button>
      </div>
    </div>
  );
}

// Edit Chat Form Component
function EditChatForm({ 
  newChatData, 
  setNewChatData, 
  onSave, 
  onCancel,
  theme 
}: { 
  newChatData: NewChatData;
  setNewChatData: (data: NewChatData) => void;
  onSave: () => void;
  onCancel: () => void;
  theme: ThemeClasses;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Chat Name *</label>
        <input
          type="text"
          value={newChatData.title}
          onChange={(e) => setNewChatData({ ...newChatData, title: e.target.value })}
          placeholder="Give your chat a name..."
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Personality</label>
        <select
          value={newChatData.personality}
          onChange={(e) => setNewChatData({ ...newChatData, personality: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        >
          <option value="Supportive Listener">Supportive Listener</option>
          <option value="Motivational Coach">Motivational Coach</option>
          <option value="Professional Therapist">Professional Therapist</option>
          <option value="Friendly Advisor">Friendly Advisor</option>
          <option value="Creative Thinker">Creative Thinker</option>
          <option value="Logical Problem Solver">Logical Problem Solver</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mood</label>
        <select
          value={newChatData.mood}
          onChange={(e) => setNewChatData({ ...newChatData, mood: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border`}
        >
          <option value="Calm">Calm</option>
          <option value="Enthusiastic">Enthusiastic</option>
          <option value="Empathetic">Empathetic</option>
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Warm">Warm</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Context (Optional)</label>
        <textarea
          value={newChatData.context}
          onChange={(e) => setNewChatData({ ...newChatData, context: e.target.value })}
          placeholder="Any specific context for this conversation..."
          rows={3}
          className={`w-full px-4 py-3 rounded-xl ${theme.input} ${theme.border} border resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Delete Confirmation Component
function DeleteConfirmation({ 
  onConfirm, 
  onCancel, 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
  theme: ThemeClasses;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold mb-2">Delete Chat?</h3>
      <p className="opacity-75 mb-6">
        Are you sure you want to delete this chat? This action cannot be undone.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ 
  isMobile, 
  
  theme,  
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  onEditChat, 
  onDeleteChat, 
  onToggleDarkMode, 
  darkMode 
}: { 
  isMobile: boolean; 
  sidebarOpen: boolean;
  theme: ThemeClasses; 
  onClose: () => void; 
  chats: Chat[]; 
  activeChat: string | null; 
  onChatSelect: (chatId: string) => void; 
  onNewChat: () => void; 
  onEditChat: (chatId: string) => void; 
  onDeleteChat: (chatId: string) => void; 
  onToggleDarkMode: () => void; 
  darkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`w-64 ${theme.sidebar} ${theme.border} border-r shadow-xl flex flex-col rounded-tr-3xl rounded-br-3xl z-10 ${
        isMobile ? "fixed inset-y-0 left-0 mt-16" : "relative"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-white/40">
        <h2 className="font-semibold text-lg text-indigo-400 hidden md:block">
          MoodMigo
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onNewChat}
            className="p-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 shadow flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="md:hidden">New Chat</span>
          </motion.button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 shadow"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 hide-scrollbar">
        {chats.slice(0, 10).map((chat) => (
          <motion.div
            key={chat.id}
            className="relative group"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all shadow-sm mb-2 ${
                chat.id === activeChat
                  ? "bg-indigo-500 text-white font-semibold"
                  : `${theme.card} hover:opacity-80`
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={16} />
                <span className="truncate flex-1">{chat.title}</span>
              </div>
              <div className="text-xs opacity-70 mt-1 truncate">
                {chat.personality} • {chat.mood}
              </div>
              {chat.messagePairs && chat.messagePairs.length > 0 && (
                <div className="text-xs opacity-50 mt-1">
                  {chat.messagePairs.length} conversations
                </div>
              )}
            </motion.button>
            
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditChat(chat.id);
                }}
                className="p-1 rounded-md bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-indigo-600 transition-colors"
                title="Edit chat"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="p-1 rounded-md bg-white/80 text-gray-600 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Delete chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {isMobile && (
        <div className="p-4 text-center text-sm opacity-70 border-t border-white/40">
          Tap outside to close
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}

// Message Bubble Component
function MessageBubble({ message, theme }: { message: { role: string; content: string; id: string; timestamp: string }; theme: ThemeClasses }) {
  const markdownComponents: Components = {
    h1: (props) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
    h2: (props) => <h2 className="text-md font-bold mt-2 mb-1" {...props} />,
    h3: (props) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
    p: (props) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2" {...props} />,
    code: ({ className, children, ...props }) => {
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded my-2 text-sm overflow-x-auto" {...props}>
          {children}
        </code>
      );
    },
    a: (props) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl shadow-md ${
        message.role === "user"
          ? theme.messageUser + " ml-auto"
          : theme.messageAI
      }`}
    >
      {message.role === "assistant" ? (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">{message.content}</div>
      )}
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ currentChat, theme }: { currentChat: Chat | null; theme: ThemeClasses }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center mt-10 md:mt-20 px-4"
    >
      <div className={`rounded-3xl p-8 max-w-md mx-auto shadow-lg ${theme.card}`}>
        <MessageCircle size={48} className="mx-auto text-indigo-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          {currentChat?.title || "New Chat"}
        </h3>
        <p className="opacity-75 mb-4">
          {currentChat?.personality} in a {currentChat?.mood?.toLowerCase()} mood
        </p>
        <p className="opacity-60 text-sm">
          Start the conversation and I'll adapt to your chosen personality style.
        </p>
      </div>
    </motion.div>
  );
}

// Main Chat Page Component
export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChatForm, setShowChatForm] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState<string | null>(null);
  const [newChatData, setNewChatData] = useState<NewChatData>({
    title: "",
    personality: "Supportive Listener",
    mood: "Calm",
    context: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personalityOptions = [
    "Supportive Listener",
    "Motivational Coach",
    "Professional Therapist",
    "Friendly Advisor",
    "Creative Thinker",
    "Logical Problem Solver"
  ];

  const moodOptions = [
    "Calm",
    "Enthusiastic",
    "Empathetic",
    "Professional",
    "Casual",
    "Warm"
  ];

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load message pairs for active chat
  const loadChatMessages = useCallback(async (chatId: string) => {
    if (!chatId) return;
    
    setIsLoadingMessages(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/${chatId}/messages?limit=50`
      );

      if (response.data.status === "success" && response.data.messages) {
        // Transform to MessagePair array
        const messagePairs: MessagePair[] = response.data.messages.map((msg: any) => ({
          id: msg.id,
          userMessage: msg.userMessage,
          aiResponse: msg.aiResponse,
          timestamp: msg.timestamp
        }));

        console.log(`Loaded ${messagePairs.length} message pairs for chat ${chatId}`);

        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, messagePairs }
            : chat
        ));
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        toast.error("Failed to load messages");
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load chats on component mount
  const getChats = useCallback(async () => {
    try {
      const user = await account.get();
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/?userId=${user.$id}&limit=20`
      );
      
      if (response.data.status === "success") {
        const fetchedChats: Chat[] = response.data.chats.map((chat: any) => ({
          id: chat._id,
          title: chat.title,
          personality: chat.personality,
          mood: chat.mood,
          context: chat.context,
          messagePairs: [], // Will be loaded separately
          messageCount: chat.messageCount || 0,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }));
        
        setChats(fetchedChats);
        
        // Set active chat to the first one if available and load its messages
        if (fetchedChats.length > 0 && !activeChat) {
          const firstChatId = fetchedChats[0].id;
          setActiveChat(firstChatId);
          await loadChatMessages(firstChatId);
        }
        
        setHasInitialLoad(true);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      toast.error("Failed to load chats");
      setHasInitialLoad(true);
    }
  }, [activeChat, loadChatMessages]);

  // Initial load
  useEffect(() => {
    if (!hasInitialLoad) {
      getChats();
    }
  }, [hasInitialLoad, getChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat && hasInitialLoad) {
      loadChatMessages(activeChat);
    }
  }, [activeChat, hasInitialLoad, loadChatMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (hasInitialLoad) {
      scrollToBottom();
    }
  }, [chats, activeChat, hasInitialLoad, scrollToBottom]);

  // Get current chat
  const currentChat = useMemo(() => {
    return chats.find((c) => c.id === activeChat) || null;
  }, [chats, activeChat]);

  // Convert message pairs to flat array for rendering
  const currentMessages = useMemo(() => {
    if (!currentChat?.messagePairs) return [];
    
    const messages: Array<{ role: string; content: string; id: string; timestamp: string }> = [];
    
    currentChat.messagePairs.forEach(pair => {
      messages.push({
        role: "user",
        content: pair.userMessage,
        id: `${pair.id}-user`,
        timestamp: pair.timestamp
      });
      messages.push({
        role: "assistant",
        content: pair.aiResponse,
        id: `${pair.id}-ai`,
        timestamp: pair.timestamp
      });
    });
    
    return messages;
  }, [currentChat]);

  // Send message function
  const handleSend = async () => {
    if (!input.trim() || !activeChat || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Get current chat state before optimistic update
    const currentChatBeforeUpdate = chats.find(chat => chat.id === activeChat);
    const currentPairs = currentChatBeforeUpdate?.messagePairs || [];

    // Optimistically update UI - add temporary user message
    const tempPairId = `temp-${Date.now()}`;
    const tempPair: MessagePair = {
      id: tempPairId,
      userMessage,
      aiResponse: "", // Placeholder for AI response
      timestamp: new Date().toISOString()
    };

    const updatedChatsWithTempPair = chats.map(chat =>
      chat.id === activeChat
        ? {
            ...chat,
            messagePairs: [...currentPairs, tempPair],
          }
        : chat
    );
    setChats(updatedChatsWithTempPair);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/messages/${activeChat}`,
        { message: userMessage }
      );

      if (response.data.status === "success" && response.data.response) {
        // Reload messages from backend to get the actual encrypted storage
        await loadChatMessages(activeChat);
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
      
      // Revert optimistic update on error
      const revertedChats = chats.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              messagePairs: currentPairs,
            }
          : chat
      );
      setChats(revertedChats);
      setInput(userMessage);
    } finally {
      setIsLoading(false);
    }

    if (isMobile) setSidebarOpen(false);
  };

  // Create new chat
  const handleCreateNewChat = () => {
    setNewChatData({
      title: "",
      personality: "Supportive Listener",
      mood: "Calm",
      context: ""
    });
    setShowChatForm(true);
  };

  const handleSubmitChatForm = async () => {
    if (!newChatData.title.trim()) {
      toast.error("Please give your chat a name!");
      return;
    }

    try {
      const user = await account.get();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats`,
        {
          userId: user.$id,
          title: newChatData.title,
          personality: newChatData.personality,
          mood: newChatData.mood,
          context: newChatData.context
        }
      );

      if (response.data.status === "success") {
        const newChat: Chat = {
          id: response.data.chat._id,
          title: response.data.chat.title,
          personality: response.data.chat.personality,
          mood: response.data.chat.mood,
          context: response.data.chat.context,
          messagePairs: [],
          createdAt: response.data.chat.createdAt
        };

        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat.id);
        setShowChatForm(false);
        toast.success("New chat created successfully!");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  };

  // Edit chat
  const handleEditChatName = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setNewChatData({
        title: chat.title,
        personality: chat.personality,
        mood: chat.mood,
        context: chat.context
      });
      setEditingChatId(chatId);
    }
  };

  const handleSaveChatEdit = async () => {
    if (!newChatData.title.trim() || !editingChatId) {
      toast.error("Chat name cannot be empty!");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/${editingChatId}`,
        {
          title: newChatData.title,
          personality: newChatData.personality,
          mood: newChatData.mood,
          context: newChatData.context
        }
      );

      if (response.data.status === "success") {
        const updatedChats = chats.map(chat =>
          chat.id === editingChatId
            ? {
                ...chat,
                title: newChatData.title,
                personality: newChatData.personality,
                mood: newChatData.mood,
                context: newChatData.context
              }
            : chat
        );

        setChats(updatedChats);
        setEditingChatId(null);
        toast.success("Chat updated successfully!");
      }
    } catch (error) {
      console.error("Error updating chat:", error);
      toast.error("Failed to update chat");
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/${chatId}`);
      
      if (response.data.status === "success") {
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);
        
        if (chatId === activeChat) {
          if (updatedChats.length > 0) {
            setActiveChat(updatedChats[0].id);
          } else {
            setActiveChat(null);
          }
        }
        
        setDeleteConfirmChatId(null);
        toast.success("Chat deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const confirmDelete = (chatId: string) => {
    setDeleteConfirmChatId(chatId);
  };

  // Refresh messages for current chat
  const refreshCurrentChatMessages = useCallback(() => {
    if (activeChat) {
      loadChatMessages(activeChat);
    }
  }, [activeChat, loadChatMessages]);

  // Clear chat messages
  const handleClearChatMessages = async () => {
    if (!activeChat) return;
    
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/${activeChat}/messages`
      );

      if (response.data.status === "success") {
        setChats(prev => prev.map(chat =>
          chat.id === activeChat
            ? { ...chat, messagePairs: [], messageCount: 0 }
            : chat
        ));
        toast.success("Chat messages cleared successfully!");
      }
    } catch (error) {
      console.error("Error clearing chat messages:", error);
      toast.error("Failed to clear chat messages");
    }
  };

  // Theme classes
  const themeClasses: ThemeClasses = darkMode 
    ? {
        bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900",
        text: "text-white",
        card: "bg-gray-800/80 backdrop-blur-lg text-white",
        input: "bg-gray-700/80 text-white placeholder-gray-400",
        button: "bg-indigo-600 hover:bg-indigo-700 text-white",
        sidebar: "bg-gray-800/80 backdrop-blur-lg text-white border-gray-700",
        messageUser: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
        messageAI: "bg-gray-700/70 text-white backdrop-blur-md",
        border: "border-gray-700"
      }
    : {
        bg: "bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100",
        text: "text-gray-800",
        card: "bg-white/80 backdrop-blur-lg text-gray-800",
        input: "bg-white/80 text-gray-700 placeholder-gray-500",
        button: "bg-indigo-500 hover:bg-indigo-600 text-white",
        sidebar: "bg-white/80 backdrop-blur-lg text-gray-800 border-white/30",
        messageUser: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
        messageAI: "bg-white/70 text-gray-800 backdrop-blur-md",
        border: "border-white/30"
      };

  return (
    <div className={`flex h-screen ${themeClasses.bg} ${themeClasses.text} transition-colors duration-300`}>
      {/* Modals */}
      <AnimatePresence>
        {showChatForm && (
          <Modal
            title="Customize Your Chat"
            onClose={() => setShowChatForm(false)}
            theme={themeClasses}
          >
            <ChatForm
              newChatData={newChatData}
              setNewChatData={setNewChatData}
              personalityOptions={personalityOptions}
              moodOptions={moodOptions}
              onSubmit={handleSubmitChatForm}
              onCancel={() => setShowChatForm(false)}
              theme={themeClasses}
            />
          </Modal>
        )}

        {editingChatId && (
          <Modal
            title="Edit Chat"
            onClose={() => setEditingChatId(null)}
            theme={themeClasses}
          >
            <EditChatForm
              newChatData={newChatData}
              setNewChatData={setNewChatData}
              onSave={handleSaveChatEdit}
              onCancel={() => setEditingChatId(null)}
              theme={themeClasses}
            />
          </Modal>
        )}

        {deleteConfirmChatId && (
          <Modal
            title="Delete Chat"
            onClose={() => setDeleteConfirmChatId(null)}
            theme={themeClasses}
          >
            <DeleteConfirmation
              onConfirm={() => handleDeleteChat(deleteConfirmChatId)}
              onCancel={() => setDeleteConfirmChatId(null)}
              theme={themeClasses}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className={`md:hidden absolute top-0 left-0 right-0 z-20 ${themeClasses.card} ${themeClasses.border} border-b p-4 flex justify-between items-center`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg ${themeClasses.button}`}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="font-semibold text-indigo-400 flex items-center gap-2">
          <MessageCircle size={20} />
          MoodMigo
        </h1>
        <div className="flex gap-2">
          <button
            onClick={refreshCurrentChatMessages}
            className="p-2 rounded-lg bg-blue-500 text-white"
            title="Refresh messages"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-600 text-white"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <Sidebar
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            theme={themeClasses}
            onClose={() => setSidebarOpen(false)}
            chats={chats}
            activeChat={activeChat}
            onChatSelect={(chatId: string) => {
              setActiveChat(chatId);
              if (isMobile) setSidebarOpen(false);
            }}
            onNewChat={handleCreateNewChat}
            onEditChat={handleEditChatName}
            onDeleteChat={confirmDelete}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 z-0 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${isMobile ? 'pt-16' : ''}`}>
        {/* Header with Chat Info */}
        <div className={`p-4 ${themeClasses.card} ${themeClasses.border} border-b flex justify-between items-center`}>
          <div className="flex-1 text-center">
            <h2 className="font-semibold text-lg">{currentChat?.title || "New Chat"}</h2>
            <p className="text-sm opacity-75">
              {currentChat?.personality} • {currentChat?.mood}
            </p>
            {currentChat?.context && (
              <p className="text-xs opacity-60 mt-1 max-w-2xl mx-auto">
                Context: {currentChat.context}
              </p>
            )}
            {currentChat?.messagePairs && currentChat.messagePairs.length > 0 && (
              <p className="text-xs opacity-50 mt-1">
                {currentChat.messagePairs.length} conversations • 
                <button 
                  onClick={refreshCurrentChatMessages}
                  className="underline hover:no-underline mx-1"
                >
                  Refresh
                </button>
                • 
                <button 
                  onClick={handleClearChatMessages}
                  className="underline hover:no-underline mx-1 text-red-500"
                >
                  Clear
                </button>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshCurrentChatMessages}
              className="p-2 rounded-lg bg-blue-500 text-white hidden md:block"
              title="Refresh messages"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-600 text-white hidden md:block"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 hide-scrollbar">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce"></div>
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : currentMessages.length > 0 ? (
            currentMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                theme={themeClasses}
              />
            ))
          ) : (
            <EmptyState currentChat={currentChat} theme={themeClasses} />
          )}
          <div ref={messagesEndRef} />
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${themeClasses.messageAI}`}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-3 md:p-4 ${themeClasses.border} border-t ${themeClasses.card} rounded-t-3xl md:rounded-t-3xl`}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className={`flex-1 border-none rounded-full px-4 md:px-5 py-3 outline-none ${themeClasses.input} shadow-inner text-sm md:text-base`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`rounded-full p-3 shadow-md flex-shrink-0 ${
                isLoading || !input.trim() 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : themeClasses.button
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}