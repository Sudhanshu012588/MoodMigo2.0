import Blogs from "../Models/Blog.js";
import BlogAccount from "../Models/BlogAccount.js";

export const createBlog = async(req,res)=>{
    try {
        const{creatorId,tittle,content,tags,Featured_Image} = req.body;
        if(!creatorId || !tittle || !content){
            return res.status(400).json({
                status:"failed",
                message:"please provide all the valid  fields"
            })
        }

        const newBlog = await Blogs.create({
            creatorId,
            tittle,
            content,
            tags,
            Featured_Image
        })
        if(newBlog){
            return res.status(200).json({
                status:"success",
                newBlog
            })
        }else{
            throw new Error("Can't create a new Blog")
        }
    } catch (error) {
        return res.status(500).json({
            status:"failed",
            message:error
        })
    }
}


export const fetchBlog = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // ✅ Fetch blogs by specific creator
      const userBlogs = await Blogs.find({ creatorId: id }).sort({ createdAt: -1 });

      return res.status(200).json({
        status: "success",
        count: userBlogs.length,
        blogs: userBlogs,
      });
    } else {
      // ✅ Fetch all blogs with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
     console.log("FInding blog")
      const blogs = await Blogs.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        const blogsWithCreator = await Promise.all(
      blogs.map(async (blog) => {
        const creator = await BlogAccount.findOne({ userId: blog.creatorId });
        return {
          ...blog.toObject(),
          creatorName: creator?.username || "Unknown",
          profilePicture:creator?.ProfilePicture
        };
      })
    );
      const total = await Blogs.countDocuments();

      return res.status(200).json({
        status: "success",
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        blogs:blogsWithCreator
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    return res.status(500).json({
      status: "failed",
      message: error.message || "Internal server error",
    });
  }
};
