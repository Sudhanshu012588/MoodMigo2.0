import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
  {
    userId:{type:String, required:true},
    Full_Name: { type: String, required: true },
    Age: { type: Number, required: true },
    Sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
    Date_of_Assessment: { type: Date, required: true },
    Contact_Information: { type: String },
    Occupation: { type: String },
    Emergency_Contact: { type: String },

    FamilyType: { type: String },
    FamilyMember: { type: String },

    diagnosed: { type: String },
    treatment: { type: String },
    treatmentType: { type: String },
    provider: { type: String },
    hospitalized: { type: String },
    hospitalReason: { type: String },

    "Feeling_down_depressed_or_hopeless": { type: String },
    "Little_interest_or_pleasure_in_doing_things": { type: String },
    "Feeling_nervous_anxious_or_on_edge": { type: String },
    "Trouble_relaxing": { type: String },
    "Excessive_worry": { type: String },
    "Fatigue_or_low_energy": { type: String },
    "Changes_in_appetite": { type: String },
    "Sleep_disturbances": { type: String },
    "Difficulty_concentrating": { type: String },
    "Thoughts_of_self_harm_or_suicide": { type: String },

    dailyFunction: { type: String },
    substanceUse: { type: String },
    substanceDetails: { type: String },
    lifeChanges: { type: String },
    changeDetails: { type: String },
    connectedness: { type: String },

    safety: { type: String },
    safetyDetails: { type: String },

    hobbies: { type: String },
    copingStrategies: [{ type: String }], // array of strings
  },
  { timestamps: true,
    collection: "Questionare", 
   }
);

const Assessment = mongoose.model("Assessment", AssessmentSchema);

export default Assessment;
