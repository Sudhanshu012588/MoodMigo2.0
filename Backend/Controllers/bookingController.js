import Booking from "../Models/Booking.js";
import { v4 as uuidv4 } from "uuid";

// 🗓 Get all booked sessions for a specific therapist
export const getBookingsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const bookings = await Booking.find({
      mentorId,
      sessionDate: { $gte: today, $lte: nextWeek },
    });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingsByUser = async (req, res) => {
  console.log("Controller called")
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({
      userId
    });
    console.log("my bookings,",bookings)
    res.status(200).json({
      status:"success",
      bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateJitsiLink = (bookingId) => {
  const baseUrl = "https://meet.jit.si/";
  const roomName = `MoodMigoSession-${bookingId}`; // unique per booking
  return `${baseUrl}${roomName}`;
};
// 🧾 Create new booking
export const createBooking = async (req, res) => {
  try {
    const { userId, userName, mentorId, mentorName, sessionDate, notes } = req.body;

    const existing = await Booking.findOne({ mentorId, sessionDate });
    if (existing)
      return res.status(400).json({ message: "Slot already booked." });

    const sessionUrl = generateJitsiLink(uuidv4());

    const booking = await Booking.create({
      userId,
      userName,
      mentorId,
      mentorName,
      sessionDate,
      sessionUrl,
      notes,
    });

    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
