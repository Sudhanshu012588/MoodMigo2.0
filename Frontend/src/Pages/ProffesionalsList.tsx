import React, { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import { motion } from "framer-motion";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";
import { useNavigate } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

interface Mentor {
  id: string;
  username: string;
  bio?: string;
  specialties: string[];
  Charges: number;
  profilephoto?: string;
}

const BookSession: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getMentors = async () => {
      try {
        const client = new Client()
          .setEndpoint("https://fra.cloud.appwrite.io/v1")
          .setProject("6826c7d8002c4477cb81");

        const databases = new Databases(client);
        const response = await databases.listDocuments(
          "6826d3a10039ef4b9444",
          "6826dd9700303a5efb90"
        );

        const fetchedMentors: Mentor[] = response.documents.map((doc: any) => {
          let specialties: string[] = [];
          if (Array.isArray(doc.specialties)) {
            specialties = doc.specialties;
          } else if (typeof doc.specialties === "string") {
            specialties = doc.specialties
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }

          return {
            id: doc.$id,
            username: doc.username || "Unknown Mentor",
            bio: doc.bio || "Experienced professional ready to help you.",
            specialties,
            Charges: Number(doc.Charges) || 0,
            profilephoto: doc.profilephoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          };
        });

        setMentors(fetchedMentors);
      } catch (error) {
        console.error("❌ Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    getMentors();
  }, []);

  if (loading) return <MoodMigoLoading />;

  return (
    <>
      <Navbar />
      <div className="mt-8 sm:mt-12 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white px-6 sm:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-3 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Find Your Perfect Mentor
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from our experienced therapists and start your growth journey today.
            </p>
          </motion.div>

          {/* Mentor Grid */}
          {mentors.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              No mentors available right now.
            </p>
          ) : (
            <motion.div
              className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.98 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {mentors.map((mentor) => (
                <motion.div
                  key={mentor.id}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/therapist/${mentor.id}`)}
                  className="bg-white shadow-lg rounded-2xl p-5 sm:p-6 border border-indigo-100 cursor-pointer w-full max-w-[270px] flex flex-col items-center text-center hover:shadow-2xl hover:border-indigo-200 hover:bg-indigo-50/40 transition relative"
                >
                  {/* Gradient Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-indigo-400/20 opacity-0 hover:opacity-100 blur-xl transition" />

                  {/* Profile */}
                  <img
                    src={mentor.profilephoto}
                    alt={mentor.username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow-sm mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {mentor.username}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Licensed Therapist
                  </p>

                  {/* Specialties */}
                  {mentor.specialties.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {mentor.specialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {mentor.specialties.length > 3 && (
                        <span className="text-xs text-gray-500">+{mentor.specialties.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 px-2">
                    {mentor.bio}
                  </p>

                  {/* Charges */}
                  <div className="flex items-center justify-center gap-1 text-indigo-700 font-semibold text-sm mb-4">
                    <Star className="w-4 h-4 text-yellow-500" /> ₹{mentor.Charges} / session
                  </div>

                  {/* Book Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookSession;
