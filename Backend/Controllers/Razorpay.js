import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const create_order = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    // console.log("✅ Amount received from frontend:", amount);
    const options = {
      amount: amount * 100, // converting rupees → paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // console.log("✅ Razorpay Order Created:", order);

    return res.status(200).json(order);
  } catch (error) {
    console.error("❌ Error while creating order:", error);
    return res.status(500).json({ error: "Failed to create Razorpay order", details: error });
  }
};


export const verify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: "failed", error: "Missing payment details" });
    }

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign === razorpay_signature) {
      return res.status(200).json({ status: "success", payment_id: razorpay_payment_id });
    } else {
      return res.status(400).json({ status: "failed", error: "Invalid signature" });
    }
  } catch (error) {
    console.error("❌ Payment verification failed:", error);
    return res.status(500).json({ status: "failed", error: "Server error during verification" });
  }
};

