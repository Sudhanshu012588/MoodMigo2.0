import { motion } from "framer-motion";
import React, { useState } from "react";
import { FileText, Image as ImageIcon, ChevronDown, X } from "lucide-react";
import axios from "axios";
import { account } from "../Appwrite/config";
import { toast } from "react-toastify";

interface Props {
  onClose?: () => void; // optional, if used as modal
}

function WriteBlog({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const predefinedTags = [
    "Mindfulness",
    "Stress",
    "Wellness",
    "Productivity",
    "Motivation",
    "Mental Health",
    "Focus",
  ];

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
      setImage(res.data.secure_url);
      console.log("Uploaded URL:", res.data.secure_url);
    } catch (err: any) {
      if (err.response) {
        console.error("Upload error:", err.response.data);
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
    setShowDropdown(false);
  };

  const handleDropdownTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await account.get();
    const creatorId = user.$id;
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/blogs/createblog`,
      {
        creatorId,
        tittle: title,
        content,
        tags,
        Featured_Image: image,
      }
    );
    if (response.data.status == "success") {
      toast.success("Blog created successfully");
    }
    if (onClose) onClose(); // close modal if used as modal
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative"
      >
        {/* Close Button */}
        {onClose && (
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        )}

        <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          Write a Blog
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-gray-600 mb-1">Title</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <FileText className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-600 mb-1">Content</label>
            <textarea
              placeholder="Write your blog here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-lg p-3 outline-none resize-none h-40"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-600 mb-1">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag (e.g. Anxiety, Wellness)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="border rounded-lg px-3 py-2 text-gray-600 hover:bg-purple-50 transition"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              {showDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-48 overflow-y-auto">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleDropdownTag(tag)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                        tags.includes(tag)
                          ? "text-purple-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-600 mb-1">Featured Image</label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : uploading ? (
                  <span className="text-sm text-gray-500">Uploading...</span>
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-xl shadow-md hover:bg-purple-700 transition"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Blog"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default WriteBlog;
