import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const MoodMigoLoading = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-200 to-white flex flex-col items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="flex items-center gap-4"
            >
                <Heart className="w-10 h-10 text-purple-400 animate-pulse" />
                <h1 className="text-4xl font-bold text-white">MoodMigo</h1>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8"
            >
                <div className="w-24 h-3 bg-gray-700 rounded-full relative overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                        className="absolute inset-0 bg-purple-500 rounded-full"
                    />
                </div>
                <p className="text-gray-400 text-center mt-2 text-sm">Loading...</p>
            </motion.div>
        </div>
    );
};

export default MoodMigoLoading;


