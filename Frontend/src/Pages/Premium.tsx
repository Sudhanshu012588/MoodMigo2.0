import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
// removed shadcn button import
// import Link from "next/link";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { account } from "../Appwrite/config";
import { Check } from "lucide-react";
// removed shadcn button import

export default function PremiumPage() {
    const navigator = useNavigate();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(499); // default: 1 month

    const plans = [
      { label: "1 Month", price: 499, original: null, save: null },
      { label: "3 Months", price: 1299, original: 1499, save: "13% saved" },
      { label: "6 Months", price: 2499, original: 2999, save: "33% saved" },
    ];

    const createOrder = async () => {
    try {
      const user = await account.get();
      if(!user) {
        toast.error("❌ Please login to proceed");
        navigator("/login");
        return;
      }
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/payment/create-order`,
        { amount }
      );
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "MoodMigo Premium",
        description: `Premium Subscription`,
        order_id: data.id,
        theme: { color: "#6C47FF" },
        handler: async (response:any) => {
          try {
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_BASE_URL}/api/payment/verify`,
              response
            );
            if (verifyRes.data.status === "success") {
              toast.success("✅ Payment Successful");
              const userId = user.$id;
              const subscriptionRes = await axios.post(
  `${import.meta.env.VITE_BACKEND_BASE_URL}/api/cache/updateCache`,
  {
    premiumDuration: amount === 499 ? 1 : amount === 1299 ? 3 : 6,
    premiumExpiry: new Date(
      new Date().setMonth(
        new Date().getMonth() + (amount === 499 ? 1 : amount === 1299 ? 3 : 6)
      )
    ).toISOString()
  },
  {
    params: {
      userId,                       // ✅ not the whole object
      operation: "premium"
    }
  }
);

            if(subscriptionRes.data.status === "success"){
              toast.success("✅ Subscription Activated");
              navigator(`/dashboard`);}

            } else {
              toast.error("❌ Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("❌ Verification error");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center py-16 px-4">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" /> Upgrade to Premium
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-gray-700 max-w-xl text-center mb-12">
          Unlock advanced features to track your wellness journey, visualize long‑term mood patterns, and access premium insights.
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-xl min-h-screen rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/40">
          <span className="text-sm font-medium px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">Most Popular</span>
          <h2 className="text-3xl font-bold mt-4 text-gray-900">MoodMigo Premium</h2>
          <p className="text-gray-600 mt-1">Choose a plan that works for you</p>

          {/* Premium Features Section */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What you get</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Progress Tracker</li>
              {/* <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> More Questionare to fill</li> */}
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Access to additional guided questionnaires</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-600" /> Dedicated community support</li>
            </ul>
          </div>

          <div className="mt-6 space-y-4">
            {plans.map((plan) => (
              <div key={plan.label} onClick={() => setAmount(plan.price)} className={`border rounded-2xl p-4 cursor-pointer transition ${amount === plan.price ? "border-indigo-600 bg-indigo-50" : "hover:border-indigo-400"}`}>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">{plan.label}</p>
                  <div className="flex flex-col items-end">
                    {plan.original && <span className="text-sm line-through text-gray-400">₹{plan.original}</span>}
                    <span className="text-2xl font-bold">₹{plan.price}</span>
                  </div>
                </div>
                {plan.save && <p className="text-xs text-green-600 font-medium">{plan.save}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <motion.button onClick={createOrder} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition">
              {loading ? "Processing..." : `Start Premium – ₹${amount}`}
            </motion.button>
          </div>

          {/* <p className="text-xs text-gray-500 mt-3 text-center">Cancel anytime. No questions asked.</p> */}
        </motion.div>
      </div>
    </>
  );
}
