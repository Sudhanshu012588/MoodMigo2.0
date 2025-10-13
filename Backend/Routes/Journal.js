import express from "express"
import { CreateJournal,fetchJournal } from "../Controllers/Journal.js";
const Journalrouter = express.Router();

Journalrouter.post("/create",CreateJournal)
Journalrouter.post("/fetch",fetchJournal)

export default Journalrouter;