import express from "express";
import { submit } from "../Controllers/SubmitQuestionare.js";
import {GetAssessment} from "../Controllers/GetAssessment.js"
const router = express.Router();

router.post('/submit', submit);
router.post('/getassessment',GetAssessment);
export default router;
