import UserPersona from "../Models/UserPersona.js";

export const GetAssessment = async (req, res) => {
    //console.log(req.body)
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide a valid userId",
      });
    }

    // ✅ Query using userId field, not _id
    const persona = await UserPersona.findOne({ userId: id });

    if (persona) {
      return res.status(200).json({
        status: "success",   // always lowercase for frontend
        TotalScore: persona.Total_Score ?? 0, // fallback if missing
      });
    } else {
      return res.status(404).json({
        status: "failed",
        message: "No assessment found for this userId",
      });
    }
  } catch (e) {
    console.error("Error in GetAssessment:", e);
    return res.status(500).json({
      status: "failed",
      message: "Can't get your assessment",
    });
  }
};
