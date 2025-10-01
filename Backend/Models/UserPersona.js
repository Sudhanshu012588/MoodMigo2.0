import mongoose from "mongoose";

const UserPersonaSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  Total_Score: [{ type: Number }], 
  Severity_Level: { type: String },
  Report_Details: {
    Strengths_and_Protective_Factors: {
      type: [String],
      default: [],
    },
    Areas_of_Concern: {
      type: [String],
      default: [],
    },
    Recommendations: {
      type: [String],
      default: [],
    },
  },
}, {
  timestamps: true,
  collection: "UserPersona",
});

const UserPersona = mongoose.model("UserPersona", UserPersonaSchema);

export default UserPersona;
