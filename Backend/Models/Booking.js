import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  mentorId: { type: String, required: true },
  mentorName: { type: String },
  sessionDate: { type: Date, required: true },
  sessionUrl: { type: String, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ["booked", "completed","Pending", "cancelled"],
    default: "booked",
  },
});
export default mongoose.model("Booking", bookingSchema);
