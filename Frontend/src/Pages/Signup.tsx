import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { OAuthProvider,ID } from "appwrite";
import { account } from "../Appwrite/config";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser({ ...user, [e.target.name]: e.target.value });

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  // Check password confirmation
  if (user.password !== user.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    // Create the account with a unique ID
    
    const created_user = await account.create(ID.unique(), user.email, user.password, user.name);
    console.log("User created:", created_user);
    const session = await account.createEmailPasswordSession(user.email, user.password);
    console.log("Session",session)
    navigate("/dashboard");
  } catch (err: any) {
    console.error("Signup error:", err);
    // Appwrite error messages may be nested differently
    setError(err.message || err.response?.message || "Signup failed");
  }
};


  const handleGoogleSignIn = () => {
    const successUrl = `${window.location.origin}/dashboard`;
    const failureUrl = `${window.location.origin}/signup`;
    account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
  };

  return (
    <>
      <div className="mb-12">
        <Navbar />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-5xl">
          {/* Illustration */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-500 items-center justify-center p-10 relative">
            <img
              src="/signupIllustration.png"
              alt="signup illustration"
              className="w-full animate-float"
            />
            <div className="absolute bottom-6 text-white text-center text-sm opacity-70 px-4">
              Your journey to better mental health starts here 🌱
            </div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                MoodMigo
              </h1>
              <h2 className="mt-2 text-xl font-semibold text-gray-800">
                Create Your Account
              </h2>
              <p className="text-gray-500 text-sm">
                Start your mental wellness journey today
              </p>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all"
            >
              {showForm ? "Hide Form" : "Sign Up"}
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
            )}

            {/* Animated Form */}
            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out ${
                showForm ? "max-h-[650px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />

                {/* Password Field with Eye Button */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field with Eye Button */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={18} />
                    ) : (
                      <EyeIcon size={18} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all"
                >
                  Create Account
                </button>
              </form>
            </div>

            {/* Google OAuth */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
