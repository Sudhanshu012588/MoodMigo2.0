import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Feather, FileText, Settings, UserPlus } from "lucide-react";
import Navbar from "../Components/Navbar";
import MoodMigoLoading from "./LoadingPage";
import CreateBlogAcc from "../Components/CreateBlogAcc";
import { account } from "../Appwrite/config";
import axios from "axios";
import BlogPreview from "../Components/BlogPreview";

interface BlogAccount {
  userId: string;
  username: string;
  bio?: string;
  ProfilePicture?: string;
  followers: number;
}
interface Blog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  Featured_Image: string;
  likes: number;
  heart: number;
  creatorName?: string;
}

function AccountPage() {
  const { id } = useParams<{ id: string }>();

  const [accountData, setAccountData] = useState<BlogAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openAcc, setOpenAcc] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const user = await account.get();
      setIsAdmin(user.$id === id);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/fetch`,
        {userId:id}
      );
      if (response.data && response.data.Account) {
        setAccountData(response.data.Account);
      }
    } catch (error) {
      console.error("Error fetching account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blogs for this account
  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/fetchBlog?id=${id}`
      );
      if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchBlogs();
    }
  }, [id]);

  // Error when no id in URL
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700">
        Error: No user ID provided in the URL.
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return <MoodMigoLoading />;
  }

  // No profile found
  if (!accountData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50 text-yellow-700">
        User profile not found.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-20 mb-10 pb-16 pt-8 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="text-4xl font-extrabold text-purple-700 text-center mb-10">
            <Feather className="inline-block h-8 w-8 mr-3" /> Blogger Dashboard
          </h1>

          {/* Profile Header */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 border-t-4 border-purple-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={accountData.ProfilePicture || "/default-avatar.png"}
              alt={accountData.username}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-purple-300 shadow-md"
            />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800">
                {accountData.username}
              </h2>
              <p className="text-sm text-purple-500 font-mono mt-1 mb-3">
                Followers: {accountData.followers}
              </p>

              <p className="text-gray-600 mt-3 max-w-lg mx-auto md:mx-0">
                {accountData.bio || "No bio added yet."}
              </p>

              {isAdmin ? (
                <button
                  onClick={() => setOpenAcc(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition"
                >
                  <Settings size={18} className="mr-2" /> Edit Profile
                </button>
              ) : (
                <button className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition">
                  <UserPlus size={18} className="mr-2" />
                  Follow
                </button>
              )}
            </div>
          </motion.div>

          {/* Modal */}
          {openAcc && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <CreateBlogAcc onClose={() => setOpenAcc(false)} />
            </div>
          )}

          {/* Published Blogs Section */}
          <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center border-b pb-2">
            <FileText className="mr-2 text-purple-500" /> Published Blogs
          </h2>
          <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow-md">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <BlogPreview
                  key={blog._id}
                  title={blog.title}
                  content={blog.content}
                  tags={blog.tags || []}
                  featuredImage={blog.Featured_Image}
                  likes={blog.likes || 0}
                  heart={blog.heart || 0}
                  creatorName={blog.creatorName || accountData.username}
                />
              ))
            ) : (
              <p className="text-lg">Blog posts will appear here once added.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
