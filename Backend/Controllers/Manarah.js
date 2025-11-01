import { Manarah } from "../Langchain/Config.js";
import { getChatHistory, saveChatHistory } from "../utils/chatMemory.js";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import chat from "../Models/Chat.js"
import ChatHistory from "../Models/ChatHistory.js";
export const getRes = async (req, res) => {
  try {
    const { userId, uuid, message} = req.body;

    //console.log("Got this payload->",userId,",",uuid,",", message)
    // Validate required fields
    if (!message) {
      return res.status(400).json({
        status: "failed",
        message: "Message field is required.",
      });
    }

    // Validate and generate UUID
    let threadId;
    if (uuid && uuidValidate(uuid)) {
      threadId = uuid; // Use existing valid UUID
    } else {
      threadId = uuidv4(); // Generate new UUID
      // //console.log(`🆕 Generated new UUID: ${threadId}`);
    }
    const Currentchat = await chat.findOne({uuid:uuid})
    //console.log("Currentchat",Currentchat)
    // ✅ Load existing history from DB/cache
    const history = await getChatHistory(threadId);

    // ✅ Initialize agent with memory
    const manarahAgent = new Manarah({
      threadId: threadId,
      personality: Currentchat.Personality || "friend",
      mood: Currentchat.Mood || "neutral",
      context: Currentchat.Context || "",
      history: history || [],
    });

    // ✅ Get AI response
    const response = await manarahAgent.respond(message);

    // ✅ Save updated history
    await saveChatHistory(threadId, manarahAgent.history);

    return res.status(200).json({
      status: "success",
      message: response,
      uuid: threadId, // Always return UUID to client
      isNewSession: !uuid // Indicate if this is a new session
    });
  } catch (error) {
    console.error("❌ getRes Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: `Can't get response: ${error.message}`,
    });
  }
};
export const getManarahAgent = async(req,res)=>{
  try{
    const {userId,ChatName,Personality,Mood,Context }=req.body;
    if(!userId){
      const uuid = uuidv4();
    const newChat = await chat.create({
      userId:"Trial Survey",
      uuid:uuid,
      ChatName:ChatName,
      Personality:Personality,
      Mood:Mood,
      Context:Context
    })
    await newChat.save();
    console.log("NEW chat: ",newChat)
    if(newChat){
      return res.status(200).json({
        status:"success",
        message:"Created new chat",
        uuid,
        chat:newChat
      })
    }
    else{
      throw new Error("Can't create mongodb instance for new chat")
    }
    }
    const uuid = uuidv4();
    const newChat = await chat.create({
      userId:userId,
      uuid:uuid,
      ChatName:ChatName,
      Personality:Personality,
      Mood:Mood,
      Context:Context
    })
    await newChat.save();
    if(newChat){
      return res.status(200).json({
        status:"success",
        message:"Created new chat",
        uuid,
        chat:newChat
      })
    }
    else{
      throw new Error("Can't create mongodb instance for new chat")
    }
  }catch(error){
    return res.status(500).json({
      status:"failed",
      message:`failed to get new agent: ${error.message}`
    })
  }

};
export const renderChat = async(req,res)=>{
  const {userId}=req.body;
  try{
    if(!userId){
      return res.status(400).json({
        status:"failed",
        message:"Please provide userId"
      })
    }

    const chats = await chat.find({userId:userId})
    if(chats){
      return res.status(200).json({
        status:"success",
        chats
      })
    }else{
      throw new Error("can't get chat's  of user ")
    }
  }catch(error){
    return res.status(500).json({
      status:"failed",
      message:`Can't fetch chats,: ${error.message}`
    })
  }
};
export const chatHistory = async (req, res) => {
  try {
    const { uuid } = req.body;

    if (!uuid) {
      return res.status(400).json({
        status: "failed",
        message: "UUID is required to fetch chat history.",
      });
    }

    // ✅ Await the promise
    const history = await getChatHistory(uuid);

    return res.status(200).json({
      status: "success",
      history: history || [],
    });
  } catch (error) {
    console.error("❌ ChatHistory Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: `Can't get history: ${error.message}`,
    });
  }
};
export const clearHistory = async(req,res)=>{
  try{
    const {userId,uuid}= req.body;

    if(!userId || !uuid){
      return res.status(400).json({
        status:"failed",
        message:"Please provide all the fields"
      })
    }
    //console.log(userId,uuid)
      const targetChat = await ChatHistory.updateOne(
        {uuid:uuid},
        { $set: { encryptedHistory: " " } }
      )
      if(targetChat){
        return res.status(200).json({
          status:"success",
          targetChat
        })
      }
      else{
        throw new Error("Can't clear chat history")
      }
  }catch(e){
    return res.status(500).json({
      status:"failed",
      message:e
    })
  }
};