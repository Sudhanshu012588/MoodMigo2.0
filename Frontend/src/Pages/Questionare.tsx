import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Smile, Heart, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { account } from "../Appwrite/config";
interface FormState {
  [key: string]: string | string[];
  Full_Name: string;
  Age: string;
  Sex: string;
  "Date of Assessment": string;
  "Contact Information": string;
  Occupation: string;
  "Emergency Contact": string;
  FamilyType: string;
  FamilyMember: string;
  diagnosed: string;
  treatment: string;
  treatmentType: string;
  provider: string;
  hospitalized: string;
  hospitalReason: string;
  "Feeling down, depressed, or hopeless": string;
  "Little interest or pleasure in doing things": string;
  "Feeling nervous, anxious, or on edge": string;
  "Trouble relaxing": string;
  "Excessive worry": string;
  "Fatigue or low energy": string;
  "Changes in appetite": string;
  "Sleep disturbances": string;
  "Difficulty concentrating": string;
  "Thoughts of self-harm or suicide": string;
  dailyFunction: string;
  substanceUse: string;
  substanceDetails: string;
  lifeChanges: string;
  changeDetails: string;
  connectedness: string;
  safety: string;
  safetyDetails: string;
  hobbies: string;
  copingStrategies: string[];
}

const initialFormState: FormState = {
  Full_Name: "",
  Age: "",
  Sex: "",
  "Date of Assessment": "",
  "Contact Information": "",
  Occupation: "",
  "Emergency Contact": "",
  FamilyType: "",
  FamilyMember: "",
  diagnosed: "",
  treatment: "",
  treatmentType: "",
  provider: "",
  hospitalized: "",
  hospitalReason: "",
  "Feeling down, depressed, or hopeless": "",
  "Little interest or pleasure in doing things": "",
  "Feeling nervous, anxious, or on edge": "",
  "Trouble relaxing": "",
  "Excessive worry": "",
  "Fatigue or low energy": "",
  "Changes in appetite": "",
  "Sleep disturbances": "",
  "Difficulty concentrating": "",
  "Thoughts of self-harm or suicide": "",
  dailyFunction: "",
  substanceUse: "",
  substanceDetails: "",
  lifeChanges: "",
  changeDetails: "",
  connectedness: "",
  safety: "",
  safetyDetails: "",
  hobbies: "",
  copingStrategies: [],
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const inputVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Questionnaire: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [step, setStep] = useState(0);

  const sections = ["A", "B", "C", "D", "E"];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setForm((prev) => {
        const strategies = prev.copingStrategies || [];
        return checked
          ? { ...prev, copingStrategies: [...strategies, value] }
          : { ...prev, copingStrategies: strategies.filter((v) => v !== value) };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

 const submitFormData = async (id: string, cleanedForm: any) => {
  console.log("Submitting Form Data:", id);

  // Map frontend keys (with spaces) -> backend schema keys (with _)
  const mappedPayload = {
    userId: id,
    Full_Name: cleanedForm["Full_Name"],
    Age: Number(cleanedForm["Age"]),
    Sex: cleanedForm["Sex"],
    Date_of_Assessment: cleanedForm["Date of Assessment"],
    Contact_Information: cleanedForm["Contact Information"],
    Occupation: cleanedForm["Occupation"],
    Emergency_Contact: cleanedForm["Emergency Contact"],

    FamilyType: cleanedForm["FamilyType"],
    FamilyMember: cleanedForm["FamilyMember"],

    diagnosed: cleanedForm["diagnosed"],
    treatment: cleanedForm["treatment"],
    treatmentType: cleanedForm["treatmentType"],
    provider: cleanedForm["provider"],
    hospitalized: cleanedForm["hospitalized"],
    hospitalReason: cleanedForm["hospitalReason"],

    Feeling_down_depressed_or_hopeless:
      cleanedForm["Feeling down, depressed, or hopeless"],
    Little_interest_or_pleasure_in_doing_things:
      cleanedForm["Little interest or pleasure in doing things"],
    Feeling_nervous_anxious_or_on_edge:
      cleanedForm["Feeling nervous, anxious, or on edge"],
    Trouble_relaxing: cleanedForm["Trouble relaxing"],
    Excessive_worry: cleanedForm["Excessive worry"],
    Fatigue_or_low_energy: cleanedForm["Fatigue or low energy"],
    Changes_in_appetite: cleanedForm["Changes in appetite"],
    Sleep_disturbances: cleanedForm["Sleep disturbances"],
    Difficulty_concentrating: cleanedForm["Difficulty concentrating"],
    Thoughts_of_self_harm_or_suicide:
      cleanedForm["Thoughts of self-harm or suicide"],

    dailyFunction: cleanedForm["dailyFunction"],
    substanceUse: cleanedForm["substanceUse"],
    substanceDetails: cleanedForm["substanceDetails"],
    lifeChanges: cleanedForm["lifeChanges"],
    changeDetails: cleanedForm["changeDetails"],
    connectedness: cleanedForm["connectedness"],

    safety: cleanedForm["safety"],
    safetyDetails: cleanedForm["safetyDetails"],

    hobbies: cleanedForm["hobbies"],
    copingStrategies: cleanedForm["copingStrategies"] || [],
  };

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/questionare/submit`,
      { id, questionare: mappedPayload }
    );
    console.log("Form data successfully submitted:", response.data);
  } catch (error) {
    console.error("Error submitting form data:", error);
  }
};


  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();
    
    // Clean up form data before submission
    const cleanedForm = { ...form };
    
    // Clear conditional fields based on dependencies
    if (form.treatment !== "Yes") {
      cleanedForm.treatmentType = "";
      cleanedForm.provider = "";
    }
    
    if (form.hospitalized !== "Yes") {
      cleanedForm.hospitalReason = "";
    }
    
    if (form.substanceUse === "Never" || !form.substanceUse) {
      cleanedForm.substanceDetails = "";
    }
    
    if (form.lifeChanges !== "Yes") {
      cleanedForm.changeDetails = "";
    }
    
    if (form.safety === "Yes") {
      cleanedForm.safetyDetails = "";
    }

    console.log("Final Form Data Submitted:", cleanedForm);
    const user = await account.get();
    const id = user.$id;
    console.log("id",id)
    submitFormData(id,cleanedForm);

    
    // Simple interpretation logic
    let severity = 0;
    const symptomKeys = [
      "Feeling down, depressed, or hopeless",
      "Little interest or pleasure in doing things",
      "Feeling nervous, anxious, or on edge",
      "Trouble relaxing",
      "Excessive worry",
      "Fatigue or low energy",
      "Changes in appetite",
      "Sleep disturbances",
      "Difficulty concentrating",
      "Thoughts of self-harm or suicide",
    ];

    const scoreMap: { [key: string]: number } = {
      "Not at all": 0,
      "Several Days": 1,
      "More than half the days": 2,
      "Nearly every day": 3,
    };

    symptomKeys.forEach(key => {
      severity += scoreMap[form[key] as string] || 0;
    });

    let result = "Thank you for completing the assessment. Your responses indicate a need for further discussion regarding your well-being.";

    if (severity < 10) {
      result = "Your responses suggest a generally good level of emotional well-being. Keep up the positive coping strategies!";
    } else if (severity >= 10 && severity < 20) {
      result = "Your responses indicate some moderate symptoms. Consider speaking to a professional for supportive care.";
    } else if (severity >= 20 || form["Thoughts of self-harm or suicide"] === "Nearly every day") {
      result = "🚨 Your responses suggest significant distress. Please seek immediate professional support.";
    }

    setInterpretation(result);
    setIsSubmitted(true);
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          form.Age.trim() !== "" &&
          form.Sex.trim() !== "" &&
          form["Date of Assessment"].trim() !== "" &&
          form["Contact Information"].trim() !== "" &&
          form.Occupation.trim() !== "" &&
          form["Emergency Contact"].trim() !== "" &&
          form.FamilyType.trim() !== ""
        );
      case 1:
        const baseValidB = form.diagnosed.trim() !== "" && 
                          form.FamilyMember.trim() !== "" && 
                          form.treatment.trim() !== "" && 
                          form.hospitalized.trim() !== "";
        if (!baseValidB) return false;
        
        const treatmentValid = form.treatment === "Yes" ? 
          (form.treatmentType.trim() !== "" && form.provider.trim() !== "") : true;
        const hospitalValid = form.hospitalized === "Yes" ? 
          form.hospitalReason.trim() !== "" : true;

        return treatmentValid && hospitalValid;
      case 2:
        return [
          "Feeling down, depressed, or hopeless",
          "Little interest or pleasure in doing things",
          "Feeling nervous, anxious, or on edge",
          "Trouble relaxing",
          "Excessive worry",
          "Fatigue or low energy",
          "Changes in appetite",
          "Sleep disturbances",
          "Difficulty concentrating",
          "Thoughts of self-harm or suicide",
        ].every((symptom) => (form[symptom] as string).trim() !== "");
      case 3:
        const baseValidD = form.dailyFunction.trim() !== "" && 
                          form.substanceUse.trim() !== "" && 
                          form.lifeChanges.trim() !== "";
        if (!baseValidD) return false;

        const substanceValid = (form.substanceUse !== "Never" && form.substanceUse !== "") ? 
          form.substanceDetails.trim() !== "" : true;
        const changesValid = form.lifeChanges === "Yes" ? 
          form.changeDetails.trim() !== "" : true;
        
        return substanceValid && changesValid;
      case 4:
        const baseValidE = form.connectedness.trim() !== "" && 
                          form.safety.trim() !== "" && 
                          form.hobbies.trim() !== "";
        if (!baseValidE) return false;
        
        const safetyValid = form.safety === "No" ? 
          form.safetyDetails.trim() !== "" : true;
        
        return safetyValid;
      default:
        return false;
    }
  };

  return (
    <>  
    <Navbar/>
    <div className="min-h-screen pb-20 mt-15  bg-gradient-to-br from-white-50 via-white to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-quicksand text-gray-900">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="form"
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 space-y-8 border border-blue-100"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={fadeIn}
            onSubmit={handleSubmit}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-blue-800">
                  MoodMigo Mental Health Questionnaire
                </h1>
              </div>
              <p className="text-gray-700 text-lg mb-2">
                Please answer the following questions to assess your mental health.
              </p>
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {step + 1}
                  </div>
                  <span className="ml-2 text-gray-600">
                    Step {step + 1} of {sections.length}
                  </span>
                </div>
                <div className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((step + 1) / sections.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Section A: General Information */}
            {step === 0 && (
              <section key="section-a">
                <div className="flex items-center mb-6 p-4 bg-blue-50 rounded-lg">
                  <Smile className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-blue-800">
                    A. General Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "Full_Name", label: "Name", type: "text", placeholder: "Full Name (Optional)", required: false },
                    { name: "Age", label: "Age", type: "number", placeholder: "Age", required: true },
                    { name: "Sex", label: "Sex", type: "select", options: ["Male", "Female", "Other"], required: true },
                    { name: "Date of Assessment", label: "Date of Assessment", type: "date", required: true },
                    { name: "Contact Information", label: "Contact Information", type: "tel", placeholder: "Phone or Email", required: true },
                    { name: "Occupation", label: "Occupation", type: "text", placeholder: "Occupation", required: true },
                    { name: "Emergency Contact", label: "Emergency Contact", type: "tel", placeholder: "Emergency Contact", required: true },
                    { name: "FamilyType", label: "Family Type", type: "select", options: ["Joint", "Nuclear", "Other"], required: true },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      variants={inputVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-gray-800 font-medium mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={form[field.name] as string}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                          required={field.required}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={form[field.name] as string}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                          required={field.required}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Section B: Medical & Psychiatric History */}
            {step === 1 && (
              <section key="section-b">
                <div className="flex items-center mb-6 p-4 bg-red-50 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600 mr-3" />
                  <h2 className="text-xl font-semibold text-red-800">
                    B. Medical & Psychiatric History
                  </h2>
                </div>

                {[
                  {
                    name: "diagnosed",
                    label: "Have you ever been diagnosed with a mental health condition?",
                    type: "select",
                    options: ["Yes", "No"]
                  },
                  {
                    name: "FamilyMember",
                    label: "Any family member ever diagnosed with a mental health condition?",
                    type: "select",
                    options: ["Yes", "No"]
                  },
                  {
                    name: "treatment",
                    label: "Are you currently receiving mental health treatment?",
                    type: "select",
                    options: ["Yes", "No"],
                    conditional: form.treatment === "Yes" && [
                      { name: "treatmentType", label: "Type of Treatment", type: "text", placeholder: "Therapy, medication, etc." },
                      { name: "provider", label: "Provider/Facility", type: "text", placeholder: "Provider Name/Facility" }
                    ]
                  },
                  {
                    name: "hospitalized",
                    label: "Have you ever been hospitalized for a mental health issue?",
                    type: "select",
                    options: ["Yes", "No"],
                    conditional: form.hospitalized === "Yes" && [
                      { name: "hospitalReason", label: "Reason for hospitalization", type: "text", placeholder: "Reason" }
                    ]
                  }
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    className="mb-6"
                  >
                    <label className="block text-gray-800 font-medium mb-3">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name={field.name}
                      value={form[field.name] as string}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {field.conditional && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {field.conditional.map(condField => (
                          <div key={condField.name}>
                            <label className="block text-gray-800 font-medium mb-2">
                              {condField.label} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={condField.type}
                              name={condField.name}
                              placeholder={condField.placeholder}
                              value={form[condField.name] as string}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                              required
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </section>
            )}

            {/* Section C: Symptoms Checklist */}
            {step === 2 && (
              <section key="section-c">
                <div className="flex items-center mb-6 p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                  <h2 className="text-xl font-semibold text-yellow-800">
                    C. Symptoms Checklist
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    "Feeling down, depressed, or hopeless",
                    "Little interest or pleasure in doing things",
                    "Feeling nervous, anxious, or on edge",
                    "Trouble relaxing",
                    "Excessive worry",
                    "Fatigue or low energy",
                    "Changes in appetite",
                    "Sleep disturbances",
                    "Difficulty concentrating",
                    "Thoughts of self-harm or suicide",
                  ].map((symptom, index) => (
                    <motion.div
                      key={symptom}
                      variants={inputVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      <label className="block text-gray-800 font-medium mb-3">
                        {symptom} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name={symptom}
                        value={form[symptom] as string}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      >
                        <option value="">Select how often</option>
                        <option>Not at all</option>
                        <option>Several Days</option>
                        <option>More than half the days</option>
                        <option>Nearly every day</option>
                      </select>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Section D: Behavioral Patterns */}
            {step === 3 && (
              <section key="section-d">
                <div className="flex items-center mb-6 p-4 bg-indigo-50 rounded-lg">
                  <Zap className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-indigo-800">
                    D. Behavioral Patterns
                  </h2>
                </div>

                {[
                  {
                    name: "dailyFunction",
                    label: "Manage daily responsibilities:",
                    type: "select",
                    options: ["Excellent", "Good", "Fair", "Poor"]
                  },
                  {
                    name: "substanceUse",
                    label: "Substance use frequency:",
                    type: "select",
                    options: ["Never", "Occasionally", "Frequently", "Daily"],
                    conditional: (form.substanceUse !== "Never" && form.substanceUse !== "") && [
                      { name: "substanceDetails", label: "If yes, please specify:", type: "text", placeholder: "Details (e.g., alcohol, marijuana, etc.)" }
                    ]
                  },
                  {
                    name: "lifeChanges",
                    label: "Major life changes recently?",
                    type: "select",
                    options: ["No", "Yes"],
                    conditional: form.lifeChanges === "Yes" && [
                      { name: "changeDetails", label: "If yes, please specify:", type: "text", placeholder: "Details (e.g., loss of job, relationship issues)" }
                    ]
                  }
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    className="mb-6"
                  >
                    <label className="block text-gray-800 font-medium mb-3">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name={field.name}
                      value={form[field.name] as string}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {field.conditional && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        {field.conditional.map(condField => (
                          <div key={condField.name}>
                            <label className="block text-gray-800 font-medium mb-2">
                              {condField.label} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={condField.type}
                              name={condField.name}
                              placeholder={condField.placeholder}
                              value={form[condField.name] as string}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                              required
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </section>
            )}

            {/* Section E: Social and Emotional Well-being */}
            {step === 4 && (
              <section key="section-e">
                <div className="flex items-center mb-6 p-4 bg-pink-50 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600 mr-3" />
                  <h2 className="text-xl font-semibold text-pink-800">
                    E. Social and Emotional Well-being
                  </h2>
                </div>

                {[
                  {
                    name: "connectedness",
                    label: "Feel connected to family/friends?",
                    type: "select",
                    options: ["Very Connected", "Somewhat Connected", "Isolated"]
                  },
                  {
                    name: "safety",
                    label: "Do you feel safe at home/community?",
                    type: "select",
                    options: ["Yes", "No"],
                    conditional: form.safety === "No" && [
                      { name: "safetyDetails", label: "If no, please specify concerns:", type: "text", placeholder: "Safety concerns" }
                    ]
                  },
                  {
                    name: "hobbies",
                    label: "Able to enjoy hobbies?",
                    type: "select",
                    options: ["Yes", "Occasionally", "No"]
                  }
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    variants={inputVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    className="mb-6"
                  >
                    <label className="block text-gray-800 font-medium mb-3">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name={field.name}
                      value={form[field.name] as string}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {field.conditional && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        {field.conditional.map(condField => (
                          <div key={condField.name}>
                            <label className="block text-gray-800 font-medium mb-2">
                              {condField.label} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type={condField.type}
                              name={condField.name}
                              placeholder={condField.placeholder}
                              value={form[condField.name] as string}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                              required
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  variants={inputVariants}
                  initial="initial"
                  animate="animate"
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <label className="block text-gray-800 font-medium mb-3">
                    Coping strategies (Select all that apply):
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {["Exercise", "Talking to someone", "Hobbies", "Avoidance", "Substance use", "Other"].map((opt) => (
                      <label key={opt} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          name="copingStrategies"
                          value={opt}
                          checked={form.copingStrategies.includes(opt)}
                          onChange={handleChange}
                          className="rounded-md text-blue-600 focus:ring-blue-500 h-5 w-5"
                        />
                        <span className="text-gray-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  step === 0 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                Back
              </button>

              <div className="text-sm text-gray-600">
                Section {sections[step]}
              </div>

              {step < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={() => isStepValid() && setStep(step + 1)}
                  disabled={!isStepValid()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isStepValid()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    isStepValid()
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-green-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submission Successful!</h2>
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <p className="text-gray-800 font-medium">{interpretation}</p>
            </div>
            <p className="text-sm text-gray-600">
              Note: This is an unvalidated, simplified interpretation for demonstration purposes only and is not a substitute for professional medical advice.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setStep(0);
                setForm(initialFormState);
              }}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Assessment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        .font-quicksand { 
          font-family: 'Quicksand', sans-serif; 
        }
      `}</style>
    </div>
    </>
  );
};

export default Questionnaire;