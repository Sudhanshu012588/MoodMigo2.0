import { useParams, useNavigate } from "react-router-dom";
import { Query, ID } from 'appwrite';
import { databases, account } from '../Appwrite/MentorsConfig';
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
  Award,
  Edit,
  Camera,
  X
} from "lucide-react";
import Navbar from "./MentorsNavbar";
import axios from 'axios';
import WriteBlog from "./MentorsWriteBlog"
function MentorsDashboard() {
    const { mentorId } = useParams();
    const [user, setUser] = useState<{
        $id: string;
        email: string;
        name?: string;
        profilepicture?: string;
        isLoggedIn: boolean;
        createdAt?: string;
        phone?: string;
        bio?: string;
        specialization?: string;
    }>({ 
        $id: '', 
        email: '', 
        isLoggedIn: false,
        name: '',
        bio: '',
        specialization: 'Mental Wellness'
    });
    const [isLoading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        specialization: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigator = useNavigate();
    const [WritingBlog,setWritingBlog]=useState<Boolean>(false)
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                if(!mentorId){
                    setLoading(false);
                    navigator('/mentorspage')
                    return;
                }
                
                // Get current user from account
                const currentUser = await account.get();
                //console.log("Current User:", currentUser);

                // Get profile data from database
                const profAttrs = await databases.listDocuments(
                    "6826d3a10039ef4b9444", 
                    "6826dd9700303a5efb90", 
                    [Query.equal("id", mentorId)]
                );
                
                //console.log("Profile Attributes:", profAttrs);

                const document = profAttrs.documents[0];
                //console.log("Document:", document);

                // Map the data correctly based on your console log structure
                const userData = {
                    $id: currentUser.$id,
                    email: currentUser.email,
                    name: currentUser.name || 'Mentor',
                    profilepicture: document?.profilephoto || '',
                    isLoggedIn: true,
                    createdAt: currentUser.$createdAt,
                    phone: document?.phone || '',
                    bio: document?.bio || 'Dedicated to helping others achieve mental wellness and personal growth.',
                    specialization: document?.specialties || 'Mental Wellness'
                };

                //console.log("Final User Data:", userData);
                setUser(userData);
                setEditForm({
                    bio: userData.bio,
                    specialization: userData.specialization
                });

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [mentorId, navigator]);

    useEffect(() => {
        //console.log("User state updated:", user);
    }, [user]);

    // Profile Picture Upload Function with Cloudinary
    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !mentorId) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Please select an image smaller than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "moodmigo_upload");

            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/upload`,
                formData
            );

            const cloudinaryUrl = cloudinaryResponse.data.secure_url;
            //console.log("Cloudinary Upload Response:", cloudinaryResponse.data);
            //console.log("Cloudinary URL:", cloudinaryUrl);

            // Find the document to update in Appwrite
            const profAttrs = await databases.listDocuments(
                "6826d3a10039ef4b9444", 
                "6826dd9700303a5efb90", 
                [Query.equal("id", mentorId)]
            );

            const document = profAttrs.documents[0];
            //console.log("Document to update:", document);

            if (document) {
                // Update existing document with Cloudinary URL
                await databases.updateDocument(
                    "6826d3a10039ef4b9444",
                    "6826dd9700303a5efb90",
                    document.$id,
                    {
                        profilephoto: cloudinaryUrl
                    }
                );
                //console.log("Updated document in Appwrite:", updatedDoc);
            } else {
                // Create new document if it doesn't exist
                await databases.createDocument(
                    "6826d3a10039ef4b9444",
                    "6826dd9700303a5efb90",
                    ID.unique(),
                    {
                        id: mentorId,
                        name: user.name,
                        email: user.email,
                        bio: user.bio,
                        specialization: user.specialization,
                        profilephoto: cloudinaryUrl
                    }
                );
                //console.log("Created new document in Appwrite:", newDoc);
            }

            // Update local state with the new Cloudinary URL
            setUser(prev => ({
                ...prev,
                profilepicture: cloudinaryUrl
            }));

            //console.log("Profile picture updated successfully with Cloudinary");

        } catch (error: any) {
            console.error("Error uploading profile picture:", error);
            if (error.response) {
                console.error("Cloudinary error response:", error.response.data);
            }
            alert('Error uploading profile picture. Please try again.');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Edit Profile Functions
    const handleEditClick = () => {
        setEditForm({
            bio: user.bio || '',
            specialization: user.specialization || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Find the document to update
            const profAttrs = await databases.listDocuments(
                "6826d3a10039ef4b9444", 
                "6826dd9700303a5efb90", 
                [Query.equal("id", mentorId?mentorId:'')]
            );

            const document = profAttrs.documents[0];
            
            if (document) {
                // Update existing document
                await databases.updateDocument(
                    "6826d3a10039ef4b9444",
                    "6826dd9700303a5efb90",
                    document.$id,
                    {
                        bio: editForm.bio,
                        specialties: editForm.specialization
                    }
                );
            } else {
                // Create new document if it doesn't exist
                await databases.createDocument(
                    "6826d3a10039ef4b9444",
                    "6826dd9700303a5efb90",
                    ID.unique(),
                    {
                        id: mentorId,
                        name: user.name,
                        email: user.email,
                        bio: editForm.bio,
                        specialization: editForm.specialization,
                        profilephoto: user.profilepicture || ''
                    }
                );
            }

            //console.log("Profile updated in database:", updatedDoc);

            // Update local state
            setUser(prev => ({
                ...prev,
                bio: editForm.bio,
                specialization: editForm.specialization
            }));

            // Log the updated data
            // //console.log('Profile updated:', {
            //     bio: editForm.bio,
            //     specialization: editForm.specialization
            // });

            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Error updating profile. Please try again.');
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return <MoodMigoLoading />;
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    const cardVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    const profilePictureVariants = {
        hidden: { scale: 0 },
        visible: {
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                delay: 0.2
            }
        }
    };

    if(WritingBlog){
        return(
            <>

            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                >
                <WriteBlog onClose={() => setWritingBlog(false)} byMentors={true}/>
            </div>
            </>
        )
    }

    return (
        <>
            <Navbar/>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 pt-20 pb-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <motion.div
                            variants={profilePictureVariants}
                            className="relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-lg cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : user.profilepicture ? (
                                <>
                                    <img 
                                        src={user.profilepicture} 
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                            // If image fails to load, fallback to icon
                                            console.error("Image failed to load:", user.profilepicture);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="relative">
                                    <User className="w-10 h-10 text-blue-600" />
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                        <Camera className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                className="hidden"
                            />
                        </motion.div>
                        <motion.h1 
                            variants={itemVariants}
                            className="text-4xl font-bold text-gray-800 mb-3"
                        >
                            Welcome, {user.name}
                        </motion.h1>
                        <motion.p 
                            variants={itemVariants}
                            className="text-xl text-blue-600 font-medium flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            {user.specialization || 'Mental Wellness Mentor'}
                            <Sparkles className="w-5 h-5" />
                        </motion.p>
<button 
onClick={()=>{setWritingBlog(!WritingBlog)}}
className="px-6 py-3 text-white font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
  Create Blog
</button>    
<button onClick={()=>navigator(`/mentordashboard/BlogPage`)}
    className="px-6 py-3 ml-2 text-white font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
    View Blogs
</button>
                </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Information Card */}
                        <motion.div
                            variants={cardVariants}
                            className="lg:col-span-2 space-y-6"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 relative"
                            >
                                <button
                                    onClick={handleEditClick}
                                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                                    <User className="w-6 h-6 text-blue-600" />
                                    Profile Information
                                </h2>
                                
                                <div className="space-y-6">
                                    <motion.div 
                                        variants={itemVariants}
                                        className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl"
                                    >
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email Address</p>
                                            <p className="text-gray-800 font-medium">{user.email}</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        variants={itemVariants}
                                        className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl"
                                    >
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">User ID</p>
                                            <p className="text-gray-800 font-mono font-medium text-sm">{user.$id}</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        variants={itemVariants}
                                        className="flex items-center gap-4 p-4 bg-green-50 rounded-xl"
                                    >
                                        <Brain className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Specialization</p>
                                            <p className="text-gray-800 font-medium">{user.specialization || 'Not specified'}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Bio Section */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-green-100"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-green-600" />
                                    About Me
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {user.bio || 'No bio provided yet. Click the edit button to add your bio.'}
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Stats & Quick Actions */}
                        <motion.div
                            variants={cardVariants}
                            className="space-y-6"
                        >
                            {/* Status Card */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-emerald-600 font-medium">Online & Active</span>
                                </div>
                                <p className="text-gray-600">Your profile is live and accessible to clients seeking guidance.</p>
                            </motion.div>

                            {/* Quick Stats */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    This Month
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Sessions Completed</span>
                                        <span className="font-bold text-xl">24</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>New Clients</span>
                                        <span className="font-bold text-xl">8</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Availability</span>
                                        <span className="font-bold text-xl">85%</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Upcoming Sessions */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    Today's Sessions
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                        <span className="text-gray-700">10:00 AM</span>
                                        <span className="text-orange-600 font-medium">Sarah M.</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-gray-700">2:30 PM</span>
                                        <span className="text-blue-600 font-medium">James L.</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-gray-700">4:00 PM</span>
                                        <span className="text-green-600 font-medium">Emma K.</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Wellness Message */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-12 text-center"
                    >
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 max-w-2xl mx-auto">
                            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                                Your Guidance Matters
                            </h3>
                            <p className="text-gray-600 text-lg">
                                Every session you conduct brings someone closer to mental wellness and peace. 
                                Thank you for being a beacon of hope and support.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-8 max-w-md w-full"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800">Edit Profile</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={editForm.specialization}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your specialization"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={editForm.bio}
                                    onChange={handleEditChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
}

export default MentorsDashboard;