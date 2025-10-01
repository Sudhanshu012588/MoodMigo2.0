import Assessment from "../Models/Assessment.js";
import UserPersona from "../Models/UserPersona.js";
import { getScore } from "../Gemini/Questionare.js";

/**
 * Helper function to convert numeric score to severity level
 */
function determineSeverity(score) {
  if (score <= 10) return "Minimal";
  if (score <= 20) return "Mild";
  if (score <= 34) return "Moderate";
  if (score <= 44) return "Severe";
  return "Critical";
}

export const submit = async (req, res) => {
  try {
    const { questionare, id } = req.body;

    if (!id || !questionare) {
      return res.status(400).json({ success: false, message: "Missing userId or questionnaire data" });
    }

    // Upsert Assessment (create or update)
    const updatedAssessment = await Assessment.findOneAndUpdate(
      { userId: id },
      { $set: questionare },
      { new: true, upsert: true }
    );

    // Respond immediately to the user
    res.status(200).json({
      success: true,
      message: "Questionnaire received. Scoring in progress.",
      data: updatedAssessment,
    });

    // --- Process scoring asynchronously ---
    (async () => {
      try {
        const scoreResponse = await getScore(JSON.stringify(updatedAssessment));
        // Update Assessment with score & report
        updatedAssessment.score = scoreResponse.score;
        updatedAssessment.reason = scoreResponse.reason;
        updatedAssessment.Report_Details = scoreResponse.reportDetails || scoreResponse.Report_Details;
        await updatedAssessment.save();

        console.log("scoreResponse.Report_Details,",scoreResponse)
        // Update or create UserPersona
        await UserPersona.findOneAndUpdate(
  { userId: id },
  {
    $push: { Total_Score: scoreResponse.Total_Score }, // append new score
    $set: {
      Severity_Level: determineSeverity(scoreResponse.Total_Score),
      Report_Details: scoreResponse.Report_Details,
    },
  },
  { new: true, upsert: true }
);

        console.log(`✅ Scoring completed for userId: ${id}`);
      } catch (err) {
        console.error("❌ Error generating score / updating UserPersona:", err);
      }
    })();

  } catch (error) {
    console.error("❌ Error in submit controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing questionnaire",
      error: error.message,
    });
  }
};
