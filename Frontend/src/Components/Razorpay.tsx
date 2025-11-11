import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { account } from "../Appwrite/config";
import { useNavigate } from "react-router-dom";
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: { color?: string };
  prefill?: { name?: string; email?: string; contact?: string };
}

interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface PaymentPageProps {
  amount: number;
  therapistDetails: any;
  selectedSlot: any;
  // setIsBooking: (v: boolean) => void;
  onPaymentSuccess: (razorpay_signature:string,razorpay_payment_id:string,razorpay_order_id:string) => void; // callback to refresh slots
  setTransactionId: (id: string) => void;
}

export default function PaymentPage({
  amount,
  therapistDetails,
  selectedSlot,
  onPaymentSuccess,
  setTransactionId,
}: PaymentPageProps) {
  const [loading, setLoading] = useState(false);
  const navigator = useNavigate();
  // ✅ Load Razorpay script only once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const createOrder = async () => {
    try {
      const user = await account.get();
      // //console.log("User details:", user);
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
      
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY as string,
        amount: data.amount,
        currency: "INR",
        name: "MoodMigo Premium",
        description: `Session with ${therapistDetails.username}`,
        order_id: data.id,
        theme: { color: "#6C47FF" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_BACKEND_BASE_URL}/api/payment/verify`,
              response
            );

            if (verifyRes.data.status === "success") {
              //console.log("Payment verified successfully",response);
              setTransactionId(response.razorpay_payment_id);
              toast.success("✅ Payment Successful");
              onPaymentSuccess(response.razorpay_signature,response.razorpay_payment_id,response.razorpay_order_id); 
            } else {
              toast.error("❌ Payment verification failed");
            }
          } catch (err) {
            //console.log(err)
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
    } catch (err:any) {
      console.error(err.message);
      if(err.message.includes(`User (role: guests) missing scopes (["account"])`)){
        navigator("/login");
        toast.error("Please login to proceed");
        return;  
      }
      toast.error("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm mt-6">
      <p className="text-gray-600 text-center text-sm mb-4">
        You selected <b>{selectedSlot.date}</b> at <b>{selectedSlot.time}</b>
      </p>

      <div className="flex justify-center mb-4">
        <span className="px-4 py-1.5 text-indigo-700 font-semibold bg-indigo-100 rounded-lg">
          ₹{amount} / session
        </span>
      </div>

      <button
        onClick={createOrder}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
          loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {loading ? "Processing..." : "Proceed to Pay"}
      </button>

      <p className="text-xs text-center mt-3 text-gray-500">
        Secure payment • Razorpay UPI / Card / Wallet
      </p>
    </div>
  );
}
