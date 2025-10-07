import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./Routes/Questionare.js";
import Blogrouter from "./Routes/Blog.js";
import connectDB from "./DB/DBconfig.js"
import chatrouter from "./Routes/chat.js";
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
    origin: process.env.FRONTEND_BASE_URL
  })
);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test route
app.get("/", (req, res) => {
  res.send("Hey There 🚀");
});


// Questionare routes
app.use("/questionare", router);
app.use("/blogs",Blogrouter)
app.use("/manarah",chatrouter)
app.use("/api/chats", chatrouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
