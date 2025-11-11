import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    razorpay_order_id: {
      type: String,
      required: true,
       // prevent duplicate transactions
    },
    razorpay_payment_id:{
      type:String,
      required:true,
    },
    razorpay_signature:{
      type:String,
      required:true
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
