import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Image as ImageIcon, FileText } from "lucide-react";
import { account } from "../Appwrite/config";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
}

function CreateBlogAcc({ onClose }: Props) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "moodmigo_upload");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/upload`,
        formData
      );
      setProfilePic(res.data.secure_url);
      setUploading(false);
      console.log("Uploaded URL:", res.data.secure_url);
    }catch (err: any) {
  if (err.response) {
    console.error("Upload error:", err.response.data);
  } else {
    console.error("Unexpected error:", err);
  }
}
};

const submitTObackend = async(userId:string,name:string,bio:string,profilePic:string|null)=>{
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/CreateAccount`,{ userId: userId, username: name, bio: bio, ProfilePicture: profilePic });
        console.log("Backend response:", response.data);
        if(response.data.status =="success"){
            toast.success("Account created successfully!")
        }else{
            throw new  Error("Failed to create account");
            
        }
    } catch (error) {
        toast.error("Error creating account. Please try again.");
        console.error("Error submitting to backend:", error);
    }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await account.get();
    const userId = user.$id;

    console.log({ userId, name, bio, profilePic });
    submitTObackend(userId,name,bio,profilePic);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md relative z-50"
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        onClick={onClose}
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
        Create Your Blog Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-gray-600 mb-1">Nick Name</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <User className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-gray-600 mb-1">Profile Picture</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="text-gray-400" size={28} />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-gray-600"
            />
          </div>
          {uploading && (
            <p className="text-xs text-blue-500 mt-1">Uploading...</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-600 mb-1">Short Bio</label>
          <div className="flex items-start border rounded-lg px-3 py-2">
            <FileText className="text-gray-400 mr-2 mt-1" size={18} />
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full outline-none resize-none"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-xl shadow-md hover:bg-purple-700 transition"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Create Account"}
        </button>
      </form>
    </motion.div>
  );
}

export default CreateBlogAcc;
