import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { Client, ID, Databases } from "appwrite";

interface PaymentPortalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  setMentorId: (id: string) => void;
  User: { id: string; name?: string; email?: string } | null;
}

interface FormData {
  ClientID: string;
  MentorID: string;
  name: string;
  email: string;
  transactionId: string;
  transactionDateTime: string;
  prefferedDateTime: string;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({
  isOpen,
  onClose,
  mentorId,
  setMentorId,
  User,
}) => {
  const [form, setForm] = useState<FormData>({
    ClientID: User?.id || "",
    MentorID: mentorId,
    name: "",
    email: "",
    transactionId: "",
    transactionDateTime: "",
    prefferedDateTime: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const client = new Client()
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject("6826c7d8002c4477cb81");

    const databases = new Databases(client);
    try {
      await databases.createDocument(
        "6826d3a10039ef4b9444",
        "68275039000cb886ff5c",
        ID.unique(),
        {
          Mentorid: mentorId,
          ClientId: form.ClientID,
          paymentDate: form.transactionDateTime,
          PreferedDate: form.prefferedDateTime,
          username: form.name,
          transactionId: form.transactionId,
          PaymentVerified: false,
          AppointmentVerified: false,
        }
      );

      toast.success("✅ Session request submitted!");
      setMentorId("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to request session.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">
          Payment Confirmation
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg p-4 border">
            <img src="/scanner.jpg" alt="QR Code" className="max-w-full max-h-48" />
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <InputField label="Transaction ID" name="transactionId" value={form.transactionId} onChange={handleChange} />
            <InputField label="Transaction Date & Time" type="datetime-local" name="transactionDateTime" value={form.transactionDateTime} onChange={handleChange} />
            <InputField label="Preferred Date & Time" type="datetime-local" name="prefferedDateTime" value={form.prefferedDateTime} onChange={handleChange} />

            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
              Confirm Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      required
    />
  </div>
);

export default PaymentPortal;
