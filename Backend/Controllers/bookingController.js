import Booking from "../Models/Booking.js";
import { v4 as uuidv4 } from "uuid";
import transaction from "../Models/Transactions.js"
// 🗓 Get all booked sessions for a specific therapist
export const getBookingsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    //console.log(mentorId)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const bookings = await Booking.find({
      mentorId,
    });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingsByUser = async (req, res) => {
  ////console.log("Controller called")
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({
      userId
    });
    ////console.log("my bookings,",bookings)
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
    const { userId, userName, mentorId, mentorName, sessionDate, notes, transactionId,Amount } = req.body;

    // ✅ Validate required fields
    if (!userId || !mentorId || !sessionDate || !transactionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check for existing booking at same date/time
    const existing = await Booking.findOne({ mentorId, sessionDate });
    if (existing) {
      return res.status(400).json({ message: "Slot already booked." });
    }

    // ✅ Generate meeting link
    const sessionUrl = generateJitsiLink(uuidv4());

    // ✅ Create the booking with Pending status
    const booking = await Booking.create({
      userId,
      userName,
      mentorId,
      mentorName,
      sessionDate,
      sessionUrl,
      notes,
      status: "Pending", // capitalized correctly
    });

    // ✅ Create transaction record linked to booking
    const newTransaction = await transaction.create({
      transactionId,
      sessionId: booking._id,
      mentorId: mentorId,
      clientId: userId,
      Amount:Amount
    });

    // ✅ Respond to frontend
    res.status(201).json({ 
      message: "Booking and transaction created successfully.",
      booking, 
      transaction: newTransaction 
    });

  } catch (error) {
    console.error("❌ Booking creation failed:", error);
    res.status(500).json({ message: error.message });
  }
};
