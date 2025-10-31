import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client, Databases, Query } from "appwrite";
import { UserCheck, BookOpen, Zap, ArrowRight, Calendar } from "lucide-react";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";
import axios from "axios";
import { toast } from "react-toastify";
import { account } from "../Appwrite/config";

interface Therapist {
  username: string;
  bio: string;
  specialties: string;
  Charges: string;
  profilephoto: string | null;
  id:string|null;
}

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
}

const TherapistProfile: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const [therapistDetails, setTherapistDetails] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // 🧠 Fetch therapist details
  const getTherapistDetails = async () => {
    if (!therapistId) return;
    try {
      const client = new Client()
        .setEndpoint("https://fra.cloud.appwrite.io/v1")
        .setProject("6826c7d8002c4477cb81");

      const databases = new Databases(client);
      const response = await databases.listDocuments(
        "6826d3a10039ef4b9444",
        "6826dd9700303a5efb90",
        [Query.equal("$id", therapistId)]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        setTherapistDetails({
          username: doc.username,
          bio: doc.bio,
          specialties: doc.specialties,
          Charges: doc.Charges,
          profilephoto: doc.profilephoto,
          id:doc.id,
        });
      } else {
        setTherapistDetails(null);
      }
    } catch (error) {
      console.error("Failed to fetch therapist details:", error);
      setTherapistDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // 🗓 Fetch next 7 days slots
  const getAvailableSlots = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bookings/mentor/${therapistId}`
      );

      const bookedSessions = res.data.bookings || [];
      const bookedTimes = bookedSessions.map((s: any) =>
        new Date(s.sessionDate).toISOString()
      );

      const slots: Slot[] = [];
      const startHour = 9;
      const endHour = 17;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);

        for (let hour = startHour; hour <= endHour; hour++) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);
          const iso = slotTime.toISOString();

          slots.push({
            date: date.toDateString(),
            time: slotTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isBooked: bookedTimes.includes(iso),
          });
        }
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  useEffect(() => {
    getTherapistDetails();
    getAvailableSlots();
  }, [therapistId]);

  // 🎟 Step 1: Select slot → Show payment section
  const handleBooking = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot first!");
      return;
    }
    setShowPaymentSection(true);
  };

  // 💳 Step 2: Confirm payment → Create booking + transaction
  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter your Transaction ID!");
      return;
    }
    if (!therapistDetails || !selectedSlot) {
      toast.error("Invalid booking details!");
      return;
    }

    setIsBooking(true);

    try {
      const user = await account.get();
      const sessionDate = new Date(
        `${selectedSlot.date} ${selectedSlot.time}`
      ).toISOString();

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bookings`,
        {
          userId: user.$id,
          userName: user.name,
          mentorId: therapistDetails.id,
          mentorName: therapistDetails.username,
          sessionDate,
          notes: `Session booked with ${therapistDetails.username}`,
          transactionId,
          Amount: therapistDetails.Charges,
        }
      );

      const { booking } = response.data;
      getAvailableSlots();
      toast.success(`✅ Booking confirmed! Session link: ${booking.sessionUrl}`);
      setShowPaymentSection(false);
      setTransactionId("");
    } catch (error: any) {
      toast.error("❌ Booking failed. Try again.");
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };

  // 🌀 Loading / Not found UI
  if (loading) return <MoodMigoLoading />;
  if (!therapistDetails)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Therapist not found</h2>
        <button
          onClick={() => navigate("/therapists")}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Back to Directory
        </button>
      </div>
    );

  const { username, bio, specialties, Charges, profilephoto } = therapistDetails;
  const specialtyTags = specialties?.split(",").map((s) => s.trim());
  const next7Days = Array.from(new Set(availableSlots.map((slot) => slot.date)));
  const slotsForSelectedDay = availableSlots.filter((slot) => slot.date === selectedDay);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16 bg-white rounded-3xl p-8 shadow-lg border border-indigo-100">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <img
              src={profilephoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt={username}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-300 shadow-md hover:scale-105 transition-transform"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-2">
                {username}
              </h1>
              <p className="text-indigo-700 flex items-center justify-center sm:justify-start gap-2">
                <UserCheck className="w-5 h-5" /> Licensed Therapist
              </p>
              <p className="mt-3 text-xl sm:text-2xl font-semibold text-gray-800">
                ₹{Charges} / session
              </p>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!selectedSlot}
            className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all
              ${selectedSlot
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Book a Session <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Section */}
        {showPaymentSection && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-3xl p-8 border border-indigo-100 shadow-md mb-12">
            <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-2xl p-4 border">
              <img src="/scanner.jpg" alt="QR Code" className="max-w-full max-h-48 rounded-lg" />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Enter Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI12345XYZ"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <button
                onClick={handlePaymentSubmit}
                disabled={isBooking}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:scale-[1.02] transition-all shadow-md"
              >
                {isBooking ? "Confirming..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        )}

        {/* About */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-600 mr-2" /> About
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl bg-white rounded-2xl p-6 shadow-sm border border-indigo-50">
            {bio}
          </p>
        </section>

        {/* Specialties */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center mb-6">
            <Zap className="w-6 h-6 text-indigo-600 mr-2" /> Specialties
          </h2>
          <div className="flex flex-wrap gap-3">
            {specialtyTags?.length ? (
              specialtyTags.map((spec, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gradient-to-tr from-purple-200 to-indigo-200 text-indigo-800 rounded-full text-sm sm:text-base font-semibold shadow-sm hover:scale-105 transition-transform"
                >
                  {spec}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">No specialties listed.</span>
            )}
          </div>
        </section>

        {/* Slots */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center mb-6">
            <Calendar className="w-6 h-6 text-purple-600 mr-2" /> Book Your Session
          </h2>

          {/* Day Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {next7Days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium border shadow-sm transition-all ${
                  selectedDay === day
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 scale-105"
                    : "bg-white border-indigo-300 hover:bg-indigo-100 text-indigo-700"
                }`}
              >
                {new Date(day).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </button>
            ))}
          </div>

          {/* Slots */}
          {selectedDay && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {slotsForSelectedDay.map((slot, idx) => (
                <button
                  key={idx}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-xl text-sm sm:text-base font-medium border shadow-sm transition-all ${
                    slot.isBooked
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedSlot?.time === slot.time && selectedSlot?.date === slot.date
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 scale-105"
                      : "bg-white border-indigo-300 hover:bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TherapistProfile;
