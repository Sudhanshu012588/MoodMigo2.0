import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client, Databases, Query } from "appwrite";
import { UserCheck, BookOpen, Zap, ArrowRight, Calendar } from "lucide-react";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";
import axios from "axios";
import {toast} from "react-toastify";
import { account } from "../Appwrite/config";
interface Therapist {
  username: string;
  bio: string;
  specialties: string;
  Charges: string;
  profilephoto: string | null;
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
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // Fetch therapist details from Appwrite
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

  // Fetch next 7 days slots and mark booked ones
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
            time: slotTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
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

  const handleBooking = async () => {
    if (!selectedSlot || !therapistDetails) {
      alert("Please select a time slot first!");
      return;
    }

    try {
      setIsBooking(true);

      

      const sessionDate = new Date(
        `${selectedSlot.date} ${selectedSlot.time}`
      ).toISOString();

//       const localTime = new Date(sessionDate).toLocaleString("en-IN", {
//   weekday: "short",
//   year: "numeric",
//   month: "short",
//   day: "numeric",
//   hour: "2-digit",
//   minute: "2-digit",
//   hour12: true,
// });
      // console.log("Booking session on:", localTime);
      const user = await account.get();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bookings`,
        {
          userId:user.$id,
          userName: user.name,
          mentorId: therapistId,
          mentorName: therapistDetails.username,
          sessionDate:sessionDate,
          notes: `Session booked with ${therapistDetails.username}`,
        }
      );

      const { booking } = response.data;
      getAvailableSlots(); // Refresh slots
      toast.success(`✅ Booking confirmed! Session link: ${booking.sessionUrl}`);
      // toast.sucess(`✅ Booking confirmed! Session link: ${booking.sessionUrl}`);
    } catch (error: any) {
      alert("❌ Booking failed. Try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <MoodMigoLoading />;

  if (!therapistDetails)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Therapist not found
        </h2>
        <button
          onClick={() => navigate("/therapists")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          Back to Directory
        </button>
      </div>
    );

  const { username, bio, specialties, Charges, profilephoto } = therapistDetails;
  const specialtyTags = specialties?.split(",").map((s) => s.trim());

  // Get unique 7 days
  const next7Days = Array.from(
    new Set(availableSlots.map((slot) => slot.date))
  );

  // Filter slots for selected day
  const slotsForSelectedDay = availableSlots.filter(
    (slot) => slot.date === selectedDay
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <img
              src={
                profilephoto ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt={username}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-300 shadow-md"
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
            disabled={!selectedSlot || isBooking}
            className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition ${
              isBooking
                ? "opacity-70 cursor-not-allowed"
                : "hover:scale-[1.03] active:scale-[0.97]"
            }`}
          >
            {isBooking ? "Booking..." : <>Book a Session <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>

        {/* About */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-600 mr-2" /> About
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">{bio}</p>
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
                  className="px-4 py-2 bg-gradient-to-tr from-purple-200 to-indigo-200 text-indigo-800 rounded-full text-sm sm:text-base font-semibold shadow-sm hover:scale-[1.02] transition"
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

          {/* Day Selection */}
          <div className="flex flex-wrap gap-3 mb-6">
            {next7Days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium border shadow-sm transition ${
                  selectedDay === day
                    ? "bg-indigo-600 text-white border-indigo-600"
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

          {/* Time Slots */}
          {selectedDay && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {slotsForSelectedDay.map((slot, idx) => (
                <button
                  key={idx}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-xl text-sm sm:text-base font-medium border shadow-sm transition ${
                    slot.isBooked
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedSlot?.time === slot.time && selectedSlot?.date === slot.date
                      ? "bg-indigo-600 text-white border-indigo-600"
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
