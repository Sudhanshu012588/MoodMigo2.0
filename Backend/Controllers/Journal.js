import journal from "../Models/Journal.js"

export const CreateJournal = async(req,res)=>{
    try{
        const {userId,Date,mood,thoughts}=req.body;
        if(!userId || !mood || !thoughts){
            return res.status(400).json({
                status:"failed",
                message:"Can't create journal entry"
            })
        }

        const newjournal = await journal.create({
            userId,
            Date,
            mood,
            thoughts
        })

        if(newjournal){
            return res.status(200).json({
                status:"success",
                message:"Journal created successfully"
            })
        }else{
            throw new Error("Journal can't be created");
        }
    }catch(e){
        res.status(500).json({
            status:"failed",
            message:e
        })
    }
}

export const fetchJournal = async (req, res) => {
  try {
    let { userId, page, limit } = req.body;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const entries = await journal
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (entries) {
      return res.status(200).json({
        status: "success",
        entries,
      });
    } else {
      throw new Error("Can't fetch Journals");
    }
  } catch (e) {
    console.error("Error fetching journals:", e);
    return res.status(500).json({
      status: "failed",
      message: e.message || e,
    });
  }
};
