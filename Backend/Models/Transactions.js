import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true, // prevent duplicate transactions
    },
    sessionId: {
      type: String,
      required: true,
    },
    mentorId: {
      type: String,
      required: true,
    },
    Amount:{
        type:Number,
        required:true
    },
    clientId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

// ✅ Correct model creation
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
