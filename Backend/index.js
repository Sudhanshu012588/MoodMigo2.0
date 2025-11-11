import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./Routes/Questionare.js";
import Blogrouter from "./Routes/Blog.js";
import connectDB from "./DB/DBconfig.js"
import chatrouter from "./Routes/chat.js";
import Journalrouter from "./Routes/Journal.js";
import bookingRoutes from "./Routes/bookingRoutes.js";
import rateLimit from "express-rate-limit";
import paymentRoutes from "./Routes/Razorpay.js"
import cacheRoutes from "./Routes/CacheData.js"
// import GoogleGenerativeAI from "@google/generative-ai"

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

// CORS
app.use(
  cors({
    origin:process.env.FRONTEND_BASE_URL
  })
);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test route
app.get("/", (req, res) => {
  res.send("Hey There 🚀");
});

const chatLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1, // 1 request every 10 seconds
  message: { error: "You are sending messages too quickly. Please slow down." },
});
// Questionare routes
app.use("/questionare", router);
app.use("/blogs",Blogrouter)

//Old route for manarah
app.use("/manarah",chatrouter)

//new route for manarah
app.use("/api/chats",chatLimiter, chatrouter);
app.use("/Journal",Journalrouter);
app.use("/api/bookings",bookingRoutes);
app.use("/api/payment",paymentRoutes)
app.use("/api/cache",cacheRoutes)
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
