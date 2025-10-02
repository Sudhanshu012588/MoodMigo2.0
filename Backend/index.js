import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./Routes/Questionare.js";
import Blogrouter from "./Routes/Blog.js";
import connectDB from "./DB/DBconfig.js"
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
// Test route
app.get("/", (req, res) => {
  res.send("Hey There 🚀");
});

// Questionare routes
app.use("/questionare", router);
app.use("/blogs",Blogrouter)
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
