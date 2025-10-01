import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // or next/navigation if Next.js

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 overflow-hidden">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 -z-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-10 h-10 rounded-full bg-purple-200 opacity-30"
            initial={{ y: "100vh", x: Math.random() * window.innerWidth }}
            animate={{ y: ["100vh", "-20vh"], x: Math.random() * window.innerWidth }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-8xl sm:text-9xl font-extrabold text-purple-600"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-xl sm:text-2xl text-gray-700 mt-4 text-center"
      >
        Oops! The page you’re looking for doesn’t exist.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
      >
        Back to Home
      </motion.button>

      {/* Animated "ghost" illustration */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="mt-12"
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-purple-400"
        >
          <path
            d="M256 32C141.1 32 48 125.1 48 240v120c0 22.1 17.9 40 40 40h16c22.1 0 40-17.9 40-40v-24c0-13.3 10.7-24 24-24s24 10.7 24 24v24c0 22.1 17.9 40 40 40h16c22.1 0 40-17.9 40-40v-24c0-13.3 10.7-24 24-24s24 10.7 24 24v24c0 22.1 17.9 40 40 40h16c22.1 0 40-17.9 40-40V240C464 125.1 370.9 32 256 32z"
            fill="currentColor"
          />
        </svg>
      </motion.div>
    </section>
  );
}
