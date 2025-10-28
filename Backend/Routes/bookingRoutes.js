import express from "express";
import { getBookingsByMentor, createBooking,getBookingsByUser } from "../Controllers/bookingController.js";

const router = express.Router();

router.get("/mentor/:mentorId", getBookingsByMentor);
router.post("/", createBooking);
router.get("/user/:userId",getBookingsByUser)
export default router;
