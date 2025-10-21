// DashboardRedesignV2.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MessageCircle, BookOpen } from "lucide-react";
import { account } from "../Appwrite/config";
import { toast } from "react-toastify";
import { useUserState } from "../Store/Userstore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";
import Chart from "../Components/Chart";
import axios from "axios";
import DiaryJournal from "../Components/DailyJournal"

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setIsLoggedIn = useUserState((state) => state.setIsLoggedIn);
  const username = useUserState((state) => state.username);
  const setUsername = useUserState((state) => state.setUsername);
  const setEmail = useUserState((state) => state.setEmail);
  const setId = useUserState((state) => state.setId);
  const [OpenJournal, setOpenJournal] = useState<Boolean>(false)
  const [Score, setScore] = useState<number[]>([])
  
  // Dummy Data
  const professionals = [
    {
      $id: "1",
      MentorName: "Dr. Smith",
      Mentorprofilepic: "/dummy-mentor.jpg",
      PreferedDate: "2025-10-02T15:00:00",
      meetingurl: "https://example.com/meet",
    },
  ];

  const getAssessment = async (id: string) => {
    console.log(id)
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/questionare/getassessment`, {
        id: id
      })
      if (response.data.status === "success") {
        setScore(response.data.TotalScore)
      } else {
        throw new Error("Failed to fetch assessment data");
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    }
  }

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await account.getSession({ sessionId: "current" });
        const userData = await account.get();

        setUsername(userData.name);
        setEmail(userData.email);
        setId(userData.$id);
        getAssessment(userData.$id);
        setLoading(false);
        setIsLoggedIn(true);
      } catch (error: any) {
        console.log(error);
        setIsLoggedIn(false);
        toast.error("You must be logged in to access the dashboard");
        navigate("/login");
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <MoodMigoLoading />;

  const mascotVariants = {
    initial: { translateY: "100%", rotate: 0 },
    hover: { translateY: "0%", rotate: 360 },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br bg-indigo-100 via-white to-purple-100 overflow-x-hidden">
      
      <Navbar />

      <div className="relative z-10 bg-transparent pb-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10 md:gap-20"
        >
          <img
            src="/Mascot_2.png"
            alt="Mascot"
            className="h-56 w-56 md:h-64 md:w-64 drop-shadow-2xl"
          />
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Hello, {username}!
            </h1>

            <p className="mt-4 text-gray-700 text-lg md:text-xl max-w-lg">
              Welcome back to your mental wellness dashboard. Explore your
              progress, sessions, and journal entries all in one place.
            </p>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-6xl mx-auto mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6"
        >
          {[
            {
              label: "MANARAH",
              description: "Your AI mental health companion.",
              icon: <Users className="w-10 h-10 text-purple-600" />,
              onClick: () => navigate("/manarah"),
            },
            {
              label: "Questionnaire",
              description: "Fill your daily mental health check-in.",
              icon: <Calendar className="w-10 h-10 text-blue-600" />,
              onClick: () => navigate("/questionnaire"),
            },
            {
              label: `Blogs`,
              description: "Explore community posts.",
              icon: <MessageCircle className="w-10 h-10 text-yellow-500" />,
              onClick: () => navigate("/blog"),
            },
          ].map(({ label, description, icon, onClick }) => {
            const isQuestionnaire = label === "Questionnaire";
            return (
              <motion.button
                key={label}
                onClick={onClick}
                whileHover={isQuestionnaire ? "hover" : {}}
                className="relative backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-6 flex flex-col gap-4 overflow-hidden hover:shadow-2xl transition-all"
              >
                {isQuestionnaire && (
                  <motion.img
                    src="/Mascot_2.png"
                    alt="mascot"
                    className="absolute bottom-0 right-0 w-16 h-16"
                    variants={mascotVariants}
                    initial="initial"
                    animate="initial"
                    whileHover="hover"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}

                <div className="flex items-center gap-3 z-10 relative">
                  {icon}
                  <h2 className="text-lg font-semibold">{label}</h2>
                </div>
                <p className="text-gray-600 text-sm z-10 relative">{description}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Progress, Sessions, Journals */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 lg:grid-cols-4 gap-8 px-6">
          {/* Left Column - Progress & Journal */}
          <div className="space-y-8">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-3xl p-6 flex flex-col justify-center items-center shadow-xl hover:shadow-2xl transition-shadow"
            >
              <span className="text-sm font-medium px-4 py-1 rounded-full bg-gradient-to-r from-purple-300 to-indigo-300 text-gray-900 mb-4">
                Your Progress
              </span>
              <Chart numbers={Score} />
            </motion.div>

            {/* Journal Entry Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="backdrop-blur-md rounded-3xl shadow-xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center"
            >
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Daily Journal
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Reflect on your thoughts and track your mood
              </p>
              <button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold flex items-center justify-center gap-2"
                onClick={() => setOpenJournal(true)}
              >
                <BookOpen className="w-5 h-5" />
                Write Journal Entry
              </button>
            </motion.div>
          </div>

          {/* Right Column - Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-3 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-gray-100"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Upcoming Sessions
            </h3>
            {professionals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming sessions.</p>
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-purple-600" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {professionals.map((session) => (
                  <div
                    key={session.$id}
                    className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={session.Mentorprofilepic}
                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {session.MentorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.PreferedDate).toLocaleDateString()} at{" "}
                          {new Date(session.PreferedDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(session.meetingurl, "_blank")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-md"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/sessions")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-105 font-semibold"
              >
                Request New Session
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Journal Modal */}
      {OpenJournal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={() => setOpenJournal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <DiaryJournal onClose={() => setOpenJournal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;