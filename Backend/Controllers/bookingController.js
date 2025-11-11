import Booking from "../Models/Booking.js";
import { v4 as uuidv4 } from "uuid";
import transaction from "../Models/Transactions.js"
import { MailService } from "../utils/MailService.js";
// 🗓 Get all booked sessions for a specific therapist
export const getBookingsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    //console.log(mentorId)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    //console.log("📌 Filtering bookings for:", mentorId);
    //console.log("📅 Date Range:", today.toISOString(), "→", nextWeek.toISOString());

    const bookings = await Booking.find({ mentorId });

    //console.log(`✅ Found ${bookings.length} bookings`);
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("❌ getBookingsByMentor error:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const getBookingsByUser = async (req, res) => {
  //////console.log("Controller called")
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({
      userId
    });
    //////console.log("my bookings,",bookings)
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
    console.log(req.body)
    const { userId, userName, mentorId, mentorName, sessionDate, notes,Amount,razorpay_order_id,razorpay_payment_id,razorpay_signature } = req.body;
    
    // ✅ Validate required fields
    if (!userId || !mentorId || !sessionDate || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature ) {
      return res.status(400).json({ message: "Missing required fields" });
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
      status: "booked", // capitalized correctly
    });
    // ✅ Create transaction record linked to booking
    const newTransaction = await transaction.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_order_id,
      sessionId: booking._id,
      mentorId: mentorId,
      clientId: userId,
      Amount:Amount
    });
    //console.log("newTransaction: ",newTransaction)
    // ✅ Respond to frontend
    
    

    res.status(201).json({ 
      message: "Booking and transaction created successfully.",
      booking, 
      transaction: newTransaction 
    });

    //Sending mail  
    (
      async()=>{
        try{
          console.log("mailing")
          const {clientName,MentorName,usermail}=req.body;

          const mailer = new MailService(clientName,MentorName,booking.sessionDate,Amount,razorpay_payment_id,booking.sessionUrl)
          const info = await mailer.SendMail(usermail);
          console.log("mail Send: ",info)
          if(info.accepted.length === 0){
            return;
          }
        }catch(err){
          console.log(err)
          return;
        }
      }
    )();

  }catch (error) {
    console.error("❌ Booking creation failed:", error);
    res.status(500).json({ message: error.message });
  }
};
