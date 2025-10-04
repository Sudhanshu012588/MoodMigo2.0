import Blogs from "../Models/Blog.js";
import BlogAccount from "../Models/BlogAccount.js";
import cache from "../Models/cache.js"
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
        const userCache = await cache.findOne({ userId: creatorId });

if (userCache) {
  // User already has a cache entry — increment their contributions
  userCache.BlogContributions = (userCache.BlogContributions || 0) + 1;
  await userCache.save();
} else {
  // Create new cache entry for first-time contributor
  await cache.create({
    userId: creatorId,
    BlogContributions: 1,
    TotalLikes: 0,
    TotalHearts: 0,
  });
}
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
            profilePicture: creator?.ProfilePicture,
          };
        })
      );

      const total = await Blogs.countDocuments();

      // ✅ FIX: Await this query to get an actual array
      const topContributors = await cache
        .find()
        .sort({ BlogContributions: -1 })
        .limit(3);
      console.log("top",topContributors)
      // ✅ Fetch associated user accounts
      const Topaccounts = await Promise.all(
        topContributors.map(async (contributor) => {
          const account = await BlogAccount.findOne({ userId: contributor.userId });
          return {
            account}
        })
      );
      console.log("Topcontri",Topaccounts)

      return res.status(200).json({
        status: "success",
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        blogs: blogsWithCreator,
        topContributors: Topaccounts,
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



export const Like = async(req,res)=>{
  try{
    const {userId,BlogId} = req.query;
    if(!userId){
      //console.log("user id",userId)
      return res.status(400).json({
        status:"failed",
        message:"Please provide a valid user id"
      }) 
    }
    else if(!BlogId){
      //console.log("BlogId",BlogId)
      return res.status(400).json({
        status:"failed",
        message:"Please provide a valid Blog id"
      })
    }
    else{
        const TargetBlog = await Blogs.findById(BlogId);
        //console.log("Found Non Liked",TargetBlog);
        const hasLiked =  TargetBlog.likes.includes(userId);
        if(hasLiked){
          TargetBlog.likes = TargetBlog.likes.filter(creatorId=> creatorId.toString() !==userId);
          await TargetBlog.save();
          //console.log("Found Liked",TargetBlog)
          return res.status(200).json({
            status:"Success",
            operation:"unliked",
            message:"Blog unliked"
          })
        }
        else{
          TargetBlog.likes.push(userId);
          await TargetBlog.save();
          //console.log("Updated Non Liked",TargetBlog)
          return res.status(200).json({
            message:"success",
            operation:"Liked",
            status:"Blog Liked",
            TargetBlog
          })
        }
    }
  }catch(e){
    //console.log(e)
    return res.status(500).json({
      status:"failed",
      message:e
    })
  }
}

export const heart = async (req, res) => {
  try {
    const { BlogId, userId } = req.query;

    // Validate input
    if (!BlogId || !userId) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide both BlogId and userId",
      });
    }

    // Find the blog
    const TargetBlog = await Blogs.findById(BlogId);
    if (!TargetBlog) {
      return res.status(404).json({
        status: "failed",
        message: "Blog not found",
      });
    }

    // Check if user has already hearted
    const hasHearted = TargetBlog.heart.includes(userId);

    if (hasHearted) {
      // Remove heart
      TargetBlog.heart = TargetBlog.heart.filter(
        (creatorId) => creatorId.toString() !== userId
      );
      await TargetBlog.save();

      return res.status(200).json({
        status: "Success",
        operation: "unhearted",
        message: "Blog unhearted successfully",
        TargetBlog,
      });
    } else {
      // Add heart
      TargetBlog.heart.push(userId);
      await TargetBlog.save();

      return res.status(200).json({
        status: "Success",
        operation: "hearted",
        message: "Blog hearted successfully",
        TargetBlog,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: error.message || error,
    });
  }
};
