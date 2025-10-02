
import { Heart, ThumbsUp } from "lucide-react";
interface BlogPreviewProps {
  title: string;
  content: string;
  tags: string[];
  featuredImage: string;
  likes: number;
  heart: number;
  creatorName: string;
}

function BlogPreview({
  title,
  content,
  tags,
  featuredImage,
  likes,
  heart,
  creatorName,
}: BlogPreviewProps) {

    
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto">
      {/* Featured Image */}
      <div className="w-full h-64 overflow-hidden">
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Blog Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{content}</p>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-4">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer: Creator + Likes */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-500">By {creatorName}</span>

          <div className="flex gap-4 items-center text-gray-600">
            <div className="flex items-center gap-1">
              <ThumbsUp size={18} /> {likes}
            </div>
            <div className="flex items-center gap-1">
              <Heart size={18} className="text-red-500" /> {heart}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogPreview;
