
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { account } from "../Appwrite/config";
import axios from "axios";
import MoodMigoLoading from "./LoadingPage";
import Navbar from "../Components/Navbar";

const GRADIENT_BG =
  "linear-gradient(180deg, #E4D3FA 0%, #E7D9FB 35%, #F0E5FF 60%, #F6EEFF 100%)";

const ManarahCall = () => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [thinking, setThinking] = useState(false);

  const recognitionRef = useRef<any | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const { uuid } = useParams<{ uuid: string }>();

  // ⏳ Splash delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // 🎤 Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event:any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim();
          setTranscript(finalText);
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

          debounceTimerRef.current = window.setTimeout(() => {
            handleFinalTranscript(finalText);
          }, 250);
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setTranscript(interim);
    };

    recognition.onerror = (e:any) => console.error("Speech error:", e.error);
    recognitionRef.current = recognition;
  }, []);

  // 🗣️ Improved Speak Function
  const speak = useCallback((text: string) => {
    setThinking(false);

    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Voices:", voices.map((v) => v.name));

      const preferred =
        voices.find((v) => /Google US English Female/i.test(v.name)) ||
        voices.find((v) => /Microsoft Aria/i.test(v.name)) ||
        voices.find((v) => /Samantha/i.test(v.name)) ||
        voices.find((v) => /Jenny/i.test(v.name)) ||
        voices.find((v) => /female|woman/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-US");

      if (preferred) utter.voice = preferred;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    } else {
      pickVoice();
    }
  }, []);

  // 💬 Fetch AI response
  const getManarahResponse = useCallback(async (userText: string): Promise<string> => {
    try {
      setThinking(true);
      const user = await account.get();
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chats/manarah/response`,
        { userId: user.$id, uuid, message: userText }
      );
      return data.message || "I’m here for you.";
    } catch {
      return "I’m listening. Tell me more.";
    }
  }, [uuid]);

  // 🧠 Handle final user speech
  const handleFinalTranscript = useCallback(
    async (finalText: string) => {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setTranscript("");

      const reply = await getManarahResponse(finalText);
      speak(reply);
    },
    [getManarahResponse, speak]
  );

  // 🎙️ Toggle mic
  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return alert("Speech recognition not supported.");

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col items-center justify-center h-screen w-screen font-sans select-none"
        style={{ background: GRADIENT_BG }}
      >
        <AnimatePresence>
          {isLoading ? (
            <MoodMigoLoading />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {/* 🧠 Mascot Animation */}
              <motion.img
                src="/Mascot_2.png"
                alt="Manarah Mascot"
                className="w-70 h-70 rounded-2xl object-cover"
                animate={isListening ? { y: [0, -10, 0] } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 2, ease: "easeInOut" }}
              />

              <h2 className="text-2xl font-bold text-[#6C55A0] tracking-wide mt-6">MANARAH</h2>
              <p className="text-[#8B75C1] mt-1 text-lg">
                {isListening ? "Listening..." : "Tap to talk"}
              </p>

              {transcript && (
                <motion.p
                  className="text-sm text-gray-500 italic mt-3 max-w-xs text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  “{transcript}”
                </motion.p>
              )}

              {thinking && (
                <motion.p
                  className="text-sm text-gray-500 italic mt-3 max-w-xs text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Thinking...
                </motion.p>
              )}

              {/* 🎙️ Mic Button */}
              <motion.button
                onClick={handleMicClick}
                className={`mt-10 w-16 h-16 flex items-center justify-center rounded-full shadow-lg text-white transition-all duration-300 ${
                  isListening ? "bg-[#B39CD0] animate-pulse" : "bg-[#6C55A0]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5S7 13.76 7 11H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ManarahCall;
