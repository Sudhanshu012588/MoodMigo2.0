import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, BookOpen, Heart, Sparkles, Calendar, Brain, X, Loader, ChevronLeft } from "lucide-react";
import axios from "axios";
import { account } from "../Appwrite/config";
import { toast } from "react-toastify";

interface DiaryJournalProps {
  onClose?: () => void;
}

interface JournalEntry {
  Date?: string;
  date: string;
  mood: string;
  thoughts: string;
  _id?: string;
}

interface MoodOption {
  emoji: string;
  label: string;
  color: string;
}

const DiaryJournal: React.FC<DiaryJournalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: "",
    thoughts: "",
  });
  const [viewMode, setViewMode] = useState<"write" | "read">("write");
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);

  const ITEMS_PER_PAGE: number = 10;
  const PRELOAD_PAGES: number = 2; // Preload next 2 pages

  const moodOptions: MoodOption[] = [
    { emoji: "😊", label: "Happy", color: "from-green-500 to-emerald-600" },
    { emoji: "😔", label: "Sad", color: "from-blue-500 to-indigo-600" },
    { emoji: "😡", label: "Angry", color: "from-red-500 to-rose-600" },
    { emoji: "😌", label: "Relaxed", color: "from-purple-500 to-violet-600" },
    { emoji: "😐", label: "Neutral", color: "from-gray-500 to-slate-600" },
    { emoji: "😰", label: "Anxious", color: "from-orange-500 to-amber-600" },
    { emoji: "🤩", label: "Excited", color: "from-yellow-500 to-orange-600" },
    { emoji: "😴", label: "Tired", color: "from-indigo-500 to-blue-600" },
  ];

  // Fetch journal entries with pagination
  const fetchJournalEntries = useCallback(async (page: number, limit: number = ITEMS_PER_PAGE): Promise<JournalEntry[]> => {
    try {
      const user = await account.get();
      const userId: string = user.$id;
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/Journal/fetch`,
        {
           page, limit ,userId
        }
      );

      if (response.data.status === "success") {
        return response.data.entries || [];
      } else {
        throw new Error("Failed to fetch journal entries");
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to load journal entries");
      return [];
    }
  }, []);

  // Helper function to filter out duplicates
 

  // Load initial data and preload next pages
  const loadEntries = useCallback(async (page: number, isInitialLoad: boolean = false): Promise<void> => {
    if (loading) return;

    setLoading(true);
    try {
      // Load current page
      const currentEntries: JournalEntry[] = await fetchJournalEntries(page);
      
      if (isInitialLoad) {
        setEntries(currentEntries);
      } else {
        setEntries(prev => [...prev, ...currentEntries]);
      }

      // Check if there are more entries
      setHasMore(currentEntries.length === ITEMS_PER_PAGE);

      // Preload next pages if we have entries
      if (currentEntries.length > 0 && hasMore) {
        for (let i = 1; i <= PRELOAD_PAGES; i++) {
          const nextPage: number = page + i;
          const preloadedEntries: JournalEntry[] = await fetchJournalEntries(nextPage);
          
          if (preloadedEntries.length > 0) {
            
            
            // Stop preloading if we reach the end
            if (preloadedEntries.length < ITEMS_PER_PAGE) {
              setHasMore(false);
              break;
            }
          } else {
            setHasMore(false);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchJournalEntries, loading, hasMore]);

  // Load initial data
  useEffect(() => {
    loadEntries(1, true);
  }, [loadEntries]);

  // Handle next entry with preloading
  const handleNextEntry = (): void => {
    const nextIndex: number = currentEntryIndex + 1;
    
    // If we're approaching the end of loaded entries, load more
    if (nextIndex >= entries.length - 3 && hasMore && !loading) {
      const nextPage: number = Math.floor(entries.length / ITEMS_PER_PAGE) + 1;
      loadEntries(nextPage);
    }

    if (nextIndex < entries.length) {
      setCurrentEntryIndex(nextIndex);
    }
  };

  // Handle previous entry
  const handlePrevEntry = (): void => {
    if (currentEntryIndex > 0) {
      setCurrentEntryIndex(currentEntryIndex - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.date || !form.mood || !form.thoughts.trim()) {
      toast.error("Please fill all fields to save your journal entry");
      return;
    }

    try {
      const user = await account.get();
      const userId: string = user.$id;
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/Journal/create`,
        {
          Date: form.date,
          mood: form.mood,
          thoughts: form.thoughts,
          userId: userId
        }
      );

      if (response.data.status === "success") {
        toast.success("Journal entry saved successfully!");
        
        // Add new entry to the beginning of the list
        const newEntry: JournalEntry = {
          date: form.date,
          mood: form.mood,
          thoughts: form.thoughts,
          _id: response.data.entryId
        };
        
        setEntries(prev => [newEntry, ...prev]);
        setForm({ 
          date: new Date().toISOString().split('T')[0], 
          mood: "", 
          thoughts: "" 
        });
        
        if (onClose) onClose();
      } else {
        throw new Error("Failed to save journal entry");
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry. Please try again.");
    }
  };

  const switchToReadMode = (): void => {
    if (entries.length > 0) {
      setViewMode("read");
      setCurrentEntryIndex(0);
    } else {
      toast.info("No journal entries found. Create your first entry!");
    }
  };

  const currentEntry: JournalEntry | undefined = entries[currentEntryIndex];

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto z-50">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      )}

      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Mindful Journal
          </h1>
          <p className="text-gray-600 text-sm">
            Capture your thoughts and track your moods
          </p>
        </motion.div>

        <motion.div
          layout
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center">
            <Brain className="w-3 h-3 text-white" />
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "write" ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    New Journal Entry
                  </h2>
                  <p className="text-gray-500 text-sm">How are you feeling today?</p>
                </div>

                {/* Date */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Mood Selection */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-500" />
                    How are you feeling?
                  </label>
                  <select
                    name="mood"
                    value={form.mood}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="">Select your current mood</option>
                    {moodOptions.map((mood: MoodOption) => (
                      <option key={mood.label} value={`${mood.emoji} ${mood.label}`}>
                        {mood.emoji} {mood.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Mood Quick Select */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {moodOptions.map((mood: MoodOption) => (
                      <motion.button
                        key={mood.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, mood: `${mood.emoji} ${mood.label}` }))}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          form.mood === `${mood.emoji} ${mood.label}`
                            ? `bg-gradient-to-r ${mood.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {mood.emoji} {mood.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Thoughts */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    Your Thoughts
                  </label>
                  <textarea
                    name="thoughts"
                    value={form.thoughts}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Write about your day, your feelings, or anything on your mind..."
                    className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!form.date || !form.mood || !form.thoughts.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    Save Entry
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={switchToReadMode}
                    disabled={entries.length === 0}
                    className="px-6 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    Read Entries
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="read"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Past Reflections</h2>
                  <p className="text-gray-500 text-sm">Your journey of self-discovery</p>
                </div>

                {/* Loading State */}
                {loading && entries.length === 0 && (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading entries...</span>
                  </div>
                )}

                {/* Journal Entry */}
                {currentEntry && (
                  <motion.div
                    key={currentEntry._id || currentEntryIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 shadow-inner"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white rounded-md shadow-sm">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {currentEntry.Date}
                        </h3>
                      </div>
                      <span className="text-xl">{currentEntry.mood.split(' ')[0]}</span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-white rounded-full text-xs font-medium text-purple-600 shadow-sm">
                        {currentEntry.mood}
                      </span>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-3 border border-white/80">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                        {currentEntry.thoughts}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-3">
                  <div className="text-xs text-gray-500">
                    Entry {currentEntryIndex + 1} of {entries.length}
                    {hasMore && entries.length > 0 && "+"}
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("write")}
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                    >
                      Write New
                    </motion.button>
                    
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrevEntry}
                        disabled={currentEntryIndex === 0}
                        className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNextEntry}
                        disabled={currentEntryIndex >= entries.length - 1 && !hasMore}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Loading more indicator */}
                
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DiaryJournal;