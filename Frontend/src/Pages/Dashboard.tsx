// DashboardRedesignV2.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MessageCircle } from "lucide-react";
import { account } from "../Appwrite/config";
import { toast } from "react-toastify";
import { useUserState } from "../Store/Userstore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setIsLoggedIn = useUserState((state) => state.setIsLoggedIn);
  const username = useUserState((state) => state.username);
  const setUsername = useUserState((state) => state.setUsername);
  const setEmail = useUserState((state) => state.setEmail);
  const setId = useUserState((state) => state.setId);

  // Dummy Data
  const numberOfBlogs = 3;
  const score = 80;
  const updateDate = "2025-09-29";
  const professionals = [
    {
      $id: "1",
      MentorName: "Dr. Smith",
      Mentorprofilepic: "/dummy-mentor.jpg",
      PreferedDate: "2025-10-02T15:00:00",
      meetingurl: "https://example.com/meet",
    },
  ];
  const journalEntries = [
    {
      $id: "j1",
      Mood: "Happy",
      Body: "Feeling great today!",
      $createdAt: new Date().toISOString(),
    },
  ];

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await account.getSession({ sessionId: "current" });
        const userData = await account.get();
        setUsername(userData.name);
        setEmail(userData.email);
        setId(userData.$id);
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
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
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
              onClick: () => navigate("/chat"),
            },
            {
              label: "Questionnaire",
              description: "Fill your daily mental health check-in.",
              icon: <Calendar className="w-10 h-10 text-blue-600" />,
              onClick: () => navigate("/questionnaire"),
            },
            {
              label: `${numberOfBlogs} Blogs`,
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
                className="relative backdrop-blur-md   border border-gray-200 shadow-lg rounded-2xl p-6 flex flex-col gap-4 overflow-hidden hover:shadow-2xl transition-all "
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
          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-3xl p-6 flex flex-col items-center shadow-xl hover:shadow-2xl transition-shadow"
          >
            <span className="text-sm font-medium px-4 py-1 rounded-full bg-gradient-to-r from-purple-300 to-indigo-300 text-gray-900">
              Your Progress
            </span>
            <p className="mt-6 text-4xl font-bold text-gray-900">{score}%</p>
            <span className="mt-4 text-sm text-gray-700 bg-gradient-to-r from-purple-200 to-indigo-200 px-3 py-1 rounded-full">
              Last Updated: {updateDate}
            </span>
          </motion.div>

          {/* Sessions */}
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
              <p className="text-gray-500 text-center">No upcoming sessions.</p>
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

          {/* Journal Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-gray-100"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Recent Journal Entries
            </h3>
            {journalEntries.length === 0 ? (
              <p className="text-gray-500 text-center">No entries yet.</p>
            ) : (
              journalEntries.map((entry) => (
                <div
                  key={entry.$id}
                  className="bg-indigo-50 p-4 rounded-2xl mb-4 shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>🙂</span>
                    <h4 className="font-semibold">{entry.Mood}</h4>
                    <span className="ml-auto text-xs italic text-gray-400">
                      {new Date(entry.$createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{entry.Body}</p>
                </div>
              ))
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/journal")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-105 font-semibold w-full"
              >
                New Journal Entry
              </button>
            </div>
          </motion.div>
        </div>
        </div>
    </div>
  );
};

export default Dashboard;
