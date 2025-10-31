import { useParams, useNavigate } from "react-router-dom";
import { Query } from "appwrite";
import { databases, account } from "../Appwrite/MentorsConfig";
import MoodMigoLoading from "../Pages/LoadingPage";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Sparkles,
  Brain,
  Heart,
  Clock,
  Camera,
  X,
  Edit, // ✅ Add this line
} from "lucide-react";
import {Client,Account} from "appwrite";
import Navbar from "./MentorsNavbar";
import axios from "axios";
import WriteBlog from "./MentorsWriteBlog";

function MentorsDashboard() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATES ---
  const [user, setUser] = useState<any>({
    $id: "",
    email: "",
    name: "",
    profilepicture: "",
    isLoggedIn: false,
    createdAt: "",
    phone: "",
    bio: "",
    specialization: "Mental Wellness",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [writingBlog, setWritingBlog] = useState(false);
  const [todaysSessions, setTodaysSessions] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    bio: "",
    specialization: "",
  });

    useEffect(() => {
    const client = new Client()
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject("6826c7d8002c4477cb81");

    const account = new Account(client);

    const getAccount = async () => {
      try {
        const mentor = await account.get();
        console.log("✅ Logged in as:", mentor);
        // You can store mentor data in state here if needed
      } catch (e) {
        console.warn("❌ Not logged in, redirecting...");
        navigate("/");
      }
    };

    getAccount();
  }, [navigate]);
  // --- HELPERS ---
  const formatToLocalTime = (utcString: string) => {
    const date = new Date(utcString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isToday = (utcString: string) => {
    const sessionDate = new Date(utcString);
    const today = new Date();
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );
  };

  // --- LOAD DASHBOARD DATA ---
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (!mentorId) {
          navigate("/mentorspage");
          return;
        }

        const currentUser = await account.get();
        const profAttrs = await databases.listDocuments(
          "6826d3a10039ef4b9444",
          "6826dd9700303a5efb90",
          [Query.equal("id", mentorId)]
        );

        const document = profAttrs.documents[0];
        const userData = {
          $id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name || "Mentor",
          profilepicture: document?.profilephoto || "",
          isLoggedIn: true,
          createdAt: currentUser.$createdAt,
          phone: document?.phone || "",
          bio:
            document?.bio ||
            "Dedicated to helping others achieve mental wellness and personal growth.",
          specialization: document?.specialties || "Mental Wellness",
        };

        setUser(userData);
        setEditForm({
          bio: userData.bio,
          specialization: userData.specialization,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [mentorId, navigate]);

  // --- FETCH TODAY'S SESSIONS ---
  const getSessionsForToday = async () => {
    if (!mentorId) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bookings/mentor/${mentorId}`
      );

      if (response?.data?.bookings?.length) {
        const todays = response.data.bookings
          .filter((s: any) => isToday(s.sessionDate))
          .map((s: any) => ({
            ...s,
            localTime: formatToLocalTime(s.sessionDate),
          }));
        setTodaysSessions(todays);
      } else {
        setTodaysSessions([]);
      }
    } catch (e: any) {
      console.error("Error fetching sessions:", e.message);
    }
  };

  useEffect(() => {
    if (mentorId) getSessionsForToday();
  }, [mentorId]);

  // --- HANDLE PROFILE PICTURE UPLOAD ---
  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !mentorId) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "moodmigo_upload");

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/upload`,
        formData
      );

      const cloudinaryUrl = cloudinaryResponse.data.secure_url;

      const profAttrs = await databases.listDocuments(
        "6826d3a10039ef4b9444",
        "6826dd9700303a5efb90",
        [Query.equal("id", mentorId)]
      );

      const document = profAttrs.documents[0];
      if (document) {
        await databases.updateDocument(
          "6826d3a10039ef4b9444",
          "6826dd9700303a5efb90",
          document.$id,
          { profilephoto: cloudinaryUrl }
        );
      }

      setUser((prev:any) => ({ ...prev, profilepicture: cloudinaryUrl }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- HANDLE PROFILE EDIT ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const profAttrs = await databases.listDocuments(
        "6826d3a10039ef4b9444",
        "6826dd9700303a5efb90",
        [Query.equal("id", mentorId || "")]
      );

      const document = profAttrs.documents[0];

      if (document) {
        await databases.updateDocument(
          "6826d3a10039ef4b9444",
          "6826dd9700303a5efb90",
          document.$id,
          {
            bio: editForm.bio,
            specialties: editForm.specialization,
          }
        );
      }

      setUser((prev:any) => ({
        ...prev,
        bio: editForm.bio,
        specialization: editForm.specialization,
      }));

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  if (isLoading) return <MoodMigoLoading />;

  // --- ANIMATION VARIANTS ---
//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 100 },
//     },
//   };

  return (
    <>
      <Navbar />
    <div className="mb-10 mt-10">
      {/* BLOG MODAL */}
      {writingBlog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <WriteBlog onClose={() => setWritingBlog(false)} byMentors />
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 pt-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-6xl mx-auto"
        >
          {/* HEADER */}
          <motion.div  className="text-center mb-12">
            <div
              className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                </div>
              ) : user.profilepicture ? (
                <>
                  <img
                    src={user.profilepicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center bg-blue-50">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome, {user.name}
            </h1>
            <p className="text-xl text-blue-600 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {user.specialization}
              <Sparkles className="w-5 h-5" />
            </p>

            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => setWritingBlog(true)}
                className="px-6 py-3 text-white rounded-full bg-gradient-to-r from-purple-600 to-blue-700 hover:shadow-lg transition"
              >
                Create Blog
              </button>
              <button
                onClick={() => navigate(`/mentordashboard/BlogPage`)}
                className="px-6 py-3 text-white rounded-full bg-gradient-to-r from-purple-600 to-blue-700 hover:shadow-lg transition"
              >
                View Blogs
              </button>
            </div>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: PROFILE INFO */}
            <motion.div
            //   variants={itemVariants}
              className="lg:col-span-2 space-y-6"
            >
              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border relative">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" /> Profile Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-xl">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-mono text-sm">{user.$id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl">
                    <Brain className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium">
                        {user.specialization || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-green-600" /> About Me
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {user.bio ||
                    "No bio provided yet. Click the edit button to add your bio."}
                </p>
              </div>
            </motion.div>

            {/* RIGHT: QUICK STATS & SESSIONS */}
            <motion.div className="space-y-6">
              {/* Status */}
              <div className="bg-white rounded-2xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 font-medium">
                    Online & Active
                  </span>
                </div>
                <p className="text-gray-600">
                  Your profile is live and visible to clients.
                </p>
              </div>

              {/* Today's Sessions */}
              <div className="bg-white rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Today's Sessions
                </h3>
                {todaysSessions.length > 0 ? (
                  <div className="space-y-3">
                    {todaysSessions.map((session, i) => (
                      <div
                        key={session._id || i}
                        className="flex justify-between items-center p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition"
                      >
                        <span className="text-gray-700">
                          {session.localTime}
                        </span>
                        <span className="text-blue-700 font-medium">
                          {session.userName}
                        </span>
                        <button className="m-3 bg-blue rounded-2xl" onClick={()=>{
                            window.open(session.sessionUrl)
                        }}>Join</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No sessions scheduled for today.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={editForm.specialization}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </>
  );
}

export default MentorsDashboard;
