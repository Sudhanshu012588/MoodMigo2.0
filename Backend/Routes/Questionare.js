import express from "express";
import { submit } from "../Controllers/SubmitQuestionare.js";

const router = express.Router();

router.post('/submit', submit);

export default router;
