import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"AIzaSyBGJ0nVzseMXgvEFSxFExXTp70TzxJ29do"});
export async function getScore(prompt) {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are a mental health scoring assistant trained to analyze questionnaire responses and generate a mental health severity score out of 50.

Your goal is to:
- Evaluate symptoms and behavioral indicators described in the user's answers.
- Assign a total score between 0 and 50.
-provide a well structured report of the condition user is going through in the given json format no need to provide more than 2 points for each field in report.
{
  userId: { type: String, required: true },
  Total_Score: {type:int}, 
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
}
- Strictly adhere to the following severity scale:

🧠 Severity Interpretation Scale:
Total Score | Severity Level | Interpretation
----------------------------------------------
  0–10      | Minimal         | No significant symptoms. Routine monitoring suggested.
 11–20      | Mild            | Early signs of distress. Recommend self-care or brief intervention.
 21–34      | Moderate        | Notable symptoms present. Clinical assessment advised.
 35–44      | Severe          | Likely functional impairment. Strongly recommend professional care.
 45–50      | Critical        | Urgent concern, possible risk behaviours. Immediate mental health intervention needed.

Respond only in raw JSON format without explanation.`,
    },
  });

  const raw = result.candidates[0].content.parts[0].text;
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
