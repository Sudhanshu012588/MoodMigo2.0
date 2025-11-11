import cache from "../Models/cache.js";

export const getcacheData = async(req,res)=>{
    try{
        const {userId}=req.params;
        if(!userId){
            return res.status(400).json({
                status:"failed",
                message:"Please provide userId",
            })
        }

        const userCache = await cache.findOne({userId});
        if(!userCache){
            return res.status(200).json({
                status:"sucess",
                message:"No cache generated"
            })
        }
        else{
            return res.status(201).json({
                status:"sucess",
                message:"Cache found",
                cache:userCache
            })
        }
    }catch(e){
        return res.status(500).json({
            status:"failed",
            message:"can't find cache",
            payload:e
        })
    }
}

export const updateCache = async(req,res)=>{
    try{
        const {operation,userId}=req.query;
        if(!operation || !userId){
            return res.status(400).json({
                status:"failed",
                message:"PLease prove all  the fields"
            })
        }
        if(operation==="premium"){
            const {premiumDuration,premiumExpiry}=req.body
            const userCache = await cache.findOneAndUpdate(
                {userId},
                {$set:{premium:true,premiumDuration,premiumExpiry}},
                {upsert: true, returnDocument: "after"}
            )

            if(userCache){
                return res.status(200).json({
                    status:"sucess",
                    message:"Upgraded to premium",
                    userCache,
                })
            }else{
                throw new Error("can't upgrade to premium");
            }
        }

        throw new Error("Something went wrong");
    }catch(e){
        console.log(e.message);
        return res.status(500).json({
            status:"failed"
        })
    }
}