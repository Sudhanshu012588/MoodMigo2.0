import BlogAccount from "../Models/BlogAccount.js";
export const CreateBlogAccount = async (req, res) => {
  try {
    const { userId, username, bio, ProfilePicture } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide valid userId and username",
      });
    }

    const updateData = { username };

    if (bio && bio.trim() !== "") {
      updateData.bio = bio;
    }

    if (ProfilePicture && ProfilePicture.trim() !== "") {
      updateData.ProfilePicture = ProfilePicture;
    }

    const account = await BlogAccount.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Blog account updated successfully",
      account,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const fetchAccount = async(req,res)=>{
    try {
        const {userId}=req.body;
        if(!userId){
            return res.status(400).json({
                status:"failed",
                message:"Please provide the user id"
            })
        }else{
            const user = await BlogAccount.findOne({userId:userId});
            if(user){
                return res.status(200).json({
                    status:"Success",
                    nessage:"Account fetch successfully",
                    Account:user
                })
            }else{
                throw new Error("unaable  to fetch account")
            }
        }
    } catch (error) {
        return res.status(500).json({
            status:"failed",
            message:error
        })
    }
}