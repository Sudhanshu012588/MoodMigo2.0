import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  
  ThumbsUp,
  Heart,
  PenSquare,
  Award,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import CreateBlogAcc from "../Components/CreateBlogAcc";
import MoodMigoLoading from "./LoadingPage";
import { useNavigate } from "react-router-dom";
import WriteBlog from "../Components/WriteBlog";
import { account } from "../Appwrite/config";
import axios from "axios";
const categories = [
  "All",
  "Mindfulness",
  "Stress",
  "Advice",
  "Productivity",
  "Wellness",
];

const BlogPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [OpenAcc, setOpenAcc] = useState(false);
  const [OpenWrite, setOpenWrite] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [userId,setUserId] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [HasAccount, setHasAccount] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const navigate = useNavigate();
  // const [tempLiked, //setTempLiked] = useState<{ [key: string]: boolean }>({});
  // const [tempHearted, //setTempHearted] = useState<{ [key: string]: boolean }>({});
  

  

  const fetchBlogs = async (pageNum: number) => {
  try {
    setIsLoading(true);
    const user: any = await account.get();
    setUserId(user.$id);

    // this route probably checks if the user has a Blog Account
    const useraccount = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/fetch`, { userId: user.$id });

    // this route actually fetches blogs + topContributors
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/fetchBlog?page=${pageNum}&limit=6`
    );

    if (useraccount.data.status === "Success") {
      setHasAccount(true);
    }

    console.log("Response:", res.data);

    setBlogs(res.data.blogs);
    setFilteredBlogs(res.data.blogs);

    // ✅ Use topContributors from the correct response
    setTopContributors(res.data.topContributors);

    setTotalPages(res.data.totalPages);
  } catch (err) {
    console.error("Error fetching blogs:", err);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(()=>{console.log("List",topContributors)},[topContributors,setTopContributors])
useEffect(() => {
    fetchBlogs(page);
  }, [page]);
const Like = async (blogId: string) => {
  try {
    // const user = await account.get();
    // const userId = user.$id;

    // Optimistically update the UI first
    setBlogs((prevBlogs: any[]) =>
      prevBlogs.map(blog => {
        if (blog._id === blogId) {
          const isCurrentlyLiked = blog.likes.includes(userId);
          if (isCurrentlyLiked) {
            // Unlike: remove user from likes
            return {
              ...blog,
              likes: blog.likes.filter((id: string) => id !== userId)
            };
          } else {
            // Like: add user to likes
            return {
              ...blog,
              likes: [...blog.likes, userId]
            };
          }
        }
        return blog;
      })
    );

    // Also update selected blog if it's open
    if (selectedBlog && selectedBlog._id === blogId) {
      setSelectedBlog((prev: any) => {
        const isCurrentlyLiked = prev.likes.includes(userId);
        return {
          ...prev,
          likes: isCurrentlyLiked 
            ? prev.likes.filter((id: string) => id !== userId)
            : [...prev.likes, userId],
          Liked: !isCurrentlyLiked,
        };
      });
    }

    // Then make the API call
    const LikeResponse = await axios.get(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/like?BlogId=${blogId}&userId=${userId}`
    );
    //setTempLiked(prev => ({ ...prev, [blogId]: !prev[blogId] }));
    //console.log("Like API response:", LikeResponse.data);
    // If API fails, revert the optimistic update
    if (LikeResponse.data.status !== "Success") {
      throw new Error("API call failed");
    }
    

  } catch (error) {
    //console.log(error)
  }
};


const Hearted = async (blogId: string) => {
  try {
    const user = await account.get();
    const userId = user.$id;

    // ✅ Optimistically update UI
    setBlogs((prevBlogs: any[]) =>
      prevBlogs.map((blog) => {
        if (blog._id === blogId) {
          const isCurrentlyHearted = blog.heart.includes(userId);
          if (isCurrentlyHearted) {
            // Unheart: remove user from heart array
            return {
              ...blog,
              heart: blog.heart.filter((id: string) => id !== userId),
            };
          } else {
            // Heart: add user to heart array
            return {
              ...blog,
              heart: [...blog.heart, userId],
            };
          }
        }
        return blog;
      })
    );

    // ✅ Update selected blog if opened
    if (selectedBlog && selectedBlog._id === blogId) {
      setSelectedBlog((prev: any) => {
        const isCurrentlyHearted = prev.heart.includes(userId);
        return {
          ...prev,
          heart: isCurrentlyHearted
            ? prev.heart.filter((id: string) => id !== userId)
            : [...prev.heart, userId],
          Hearted: !isCurrentlyHearted,
        };
      });
    }

    // ✅ API call
    
    // ✅ Store temporary state for animation / icon toggling
    //setTempHearted((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
    const HeartResponse = await axios.get(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/heart?BlogId=${blogId}&userId=${userId}`
    );

    //console.log("Heart API response:", HeartResponse.data);

    // ✅ If backend fails, revert the change
    if (HeartResponse.data.status !== "Success") {
      throw new Error("API call failed");
    }
  } catch (error) {
    console.error("Error updating heart:", error);
  }
};


  const goToDashboard = async () => {
    const user = await account.get();
    navigate(`/account/${user.$id}`);
  };

  useEffect(() => {
    console.log("Selected Category:", selectedCategory);
    setFilteredBlogs(blogs.filter(blog =>{
      if(selectedCategory==="All") return true;
      return blog.tags.includes(selectedCategory);
    }));
  },[selectedCategory,setSelectedCategory]);

  if (isLoading) return <MoodMigoLoading />;

  // Separate featured blog (most liked)
  const featuredBlog =
    blogs.length > 0
      ? blogs.reduce((max, blog) => (blog.likes.length > max.likes ? blog : max), blogs[0])
      : null;
  // const otherBlogs = blogs.filter((b) => b._id !== featuredBlog?._id);

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 pb-10 bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-gray-800">
        {/* Header Section */}
        

        <div className="max-w-7xl mx-auto px-6 py-8 -mt-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dashboard Button */}
              <div className="flex justify-end lg:justify-start">
                <button
                  onClick={goToDashboard}
                  className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  title="Go to Dashboard"
                >
                  <User size={20} className="text-purple-600" />
                </button>
              </div>

              {/* Search */}
              {/* <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Search className="text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    className="ml-3 w-full bg-transparent outline-none placeholder-gray-400"
                  />
                </div>
              </div> */}

              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
                    <p className="text-sm font-bold text-gray-600">Our Top Contributors</p>
              {Array.isArray(topContributors) && topContributors.length > 0 ? (
  topContributors.map((contributor, index) => (
    <div
      key={contributor.account?._id || index}
      className={`flex items-center gap-4 p-3 bg-gradient-to-r rounded-xl border`}
    >
      <div className="relative">
        <img
          src={
            contributor.account?.ProfilePicture ||
            `https://i.pravatar.cc/40?img=${index + 5}`
          }
          alt={contributor.account?.username || "User"}
          className={`w-12 h-12 rounded-full border-2 `}
        />
        <Award className={`absolute -top-1 -right-1 text-yellow-500 fill-current`} size={16} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">
          {contributor.account?.username || "Anonymous"}
        </p>
        {/* <p className="text-sm text-gray-600">
          {contributor.userStats?.BlogContributions || 0} articles
        </p> */}
      </div>
    </div>
  ))
) : (
  <p className="text-gray-500 text-sm">No top contributors yet.</p>
)}


              {/* Action Buttons */}
              <div className="space-y-4">
                {HasAccount&&(<button
                  onClick={() => setOpenWrite(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <PenSquare size={20} /> Write a Blog
                </button>)}
                
                <div className="grid grid-cols-2 gap-3">
                  {HasAccount&&(<button
                    onClick={() => goToDashboard()}
                    className="bg-white text-purple-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all duration-300 border border-purple-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <User size={18} />Your Account
                  </button>)}
                  {!HasAccount&&(
<button
                    onClick={() => setOpenAcc(true)}
                    className="bg-white text-purple-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all duration-300 border border-purple-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <PenSquare size={18} /> Create Account
                  </button>
                  )}
                  
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Blog */}
              {featuredBlog && (
                <motion.div
                  key={featuredBlog._id}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl shadow-2xl overflow-hidden cursor-pointer mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setSelectedBlog(featuredBlog)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 relative">
                      <img
                        src={featuredBlog.Featured_Image}
                        alt={featuredBlog.tittle}
                        className="w-full h-64 md:h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg">
                          🔥 MostLiked
                        </span>
                      </div>
                    </div>
                    <div className="md:w-3/5 p-8 text-white">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                        {featuredBlog.tittle}
                      </h2>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={featuredBlog.profilePicture || "/default-avatar.png"}
                          alt={featuredBlog.creatorName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                        <div>
                          <p className="font-semibold">{featuredBlog.creatorName || "Unknown"}</p>
                          <p className="text-purple-100 text-sm">Top Contributor</p>
                        </div>
                      </div>
                      <p className="text-purple-100 line-clamp-2 mb-4 leading-relaxed">
                        {featuredBlog.content || "No content available."}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredBlog.tags?.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-6 text-white/80">
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                          <button onClick={()=>{Like(featuredBlog._id) }}>
                            {!featuredBlog.likes.includes(userId) ?(<ThumbsUp size={18} />):(<ThumbsUp size={18} className="text-purple-300 fill-current" />)}
                            {featuredBlog.likes.length || 0}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                          <button onClick={()=>{Hearted(featuredBlog._id)}}>
                          {featuredBlog.heart.includes(userId)?(<Heart size={18} className="text-red-500 fill-current" />)  :(<Heart size={18}  />)}{featuredBlog.heart.length || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Other Blogs Grid */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Latest Articles</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog, idx) => (
                    <motion.div
                      key={blog._id || idx}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      onClick={() => setSelectedBlog(blog)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={blog.Featured_Image}
                          alt={blog.tittle}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {blog.tittle}
                        </h4>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={blog.profilePicture || "/default-avatar.png"}
                            alt={blog.creatorName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <p className="text-sm text-gray-600">
                            By {blog.creatorName || "Unknown"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags?.slice(0, 2).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {blog.tags && blog.tags.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                              +{blog.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-gray-500 border-t border-gray-100 pt-4">
                            <button onClick={()=>{Like(blog._id)}}>
                          <div className="flex items-center gap-2">
                            {
!blog.likes.includes(userId)?(<ThumbsUp size={16}/>):(<ThumbsUp size={18} className="text-purple-300 fill-current" />)
                            }
                            <span className="text-sm font-medium">{blog.likes.length || 0}</span>
                          </div>
                            </button>

                            <button onClick={()=>{Hearted(blog._id)}}>

                          <div className="flex items-center gap-2">
                            {blog.heart.includes(userId)?(<Heart size={16} className="text-red-500 fill-current" />  ): (<Heart size={16}  />)}
                            <span className="text-sm font-medium">{blog.heart.length || 0}</span>
                          </div>
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 font-semibold border border-purple-200"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                        page === pageNum
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 font-semibold border border-purple-200"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {OpenAcc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <CreateBlogAcc onClose={() => setOpenAcc(false)} />
          </div>
        )}
        {OpenWrite && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <WriteBlog onClose={() => setOpenWrite(false)} />
          </div>
        )}

        {/* Blog Popup */}
        {selectedBlog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="relative">
                <img
                  src={selectedBlog.Featured_Image}
                  alt={selectedBlog.tittle}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ✖
                </button>
              </div>
              
              <div className="p-8 max-h-[calc(90vh-16rem)] overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedBlog.tittle}
                </h2>
                
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
                  <img
                    src={selectedBlog.profilePicture || "/default-avatar.png"}
                    alt={selectedBlog.creatorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedBlog.creatorName || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">Community Writer</p>
                  </div>
                  <div className="ml-auto flex gap-4">
                    <button onClick={()=>{Like(selectedBlog._id)}}>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                      {!selectedBlog.likes.includes(userId)?(<ThumbsUp size={18}/>):(<ThumbsUp size={18} className="text-purple-300 fill-current" />)}
                      <span className="font-semibold">{selectedBlog.likes.length || 0}</span>
                    </div>
                    </button>

                    <button onClick={()=>{Hearted(selectedBlog._id)}}>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                      {selectedBlog.heart.includes(userId)?(<Heart size={18} className="text-red-500 fill-current" />)  : (<Heart size={18}  />)}
                      <span className="font-semibold">{selectedBlog.heart.length || 0}</span>
                    </div>
                    </button>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {selectedBlog.content || "No content available."}
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
                  {selectedBlog.tags?.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;