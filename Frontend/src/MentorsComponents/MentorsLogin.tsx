import { useState, useEffect } from 'react';
import {  useNavigate, useLocation } from 'react-router-dom';
import Navbar from './MentorsNavbar';
import { account } from '../Appwrite/MentorsConfig';
import { toast } from 'react-toastify';
import { useUserState } from '../Store/Userstore';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import MoodMigoLoading from '../Pages/LoadingPage';

interface UserField {
  email: string;
  password: string;
}

export default function MentorsLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setIsLoggedIn = useUserState((s) => s.setIsLoggedIn);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<UserField>({ email: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<Boolean>();
  useEffect(()=>{
    const getAccount = async()=>{
      try{
      setLoading(true);
      const user = await account.get();
      if(user){
        setLoading(false);
        navigate(`/mentorsdashboard/${user.$id}`);
      }else{
        setLoading(false);
        return;
      }
    }catch(err){
      setLoading(false);
      return;
    }}
    getAccount();
  },[])
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      try {
        const errObj = JSON.parse(errorParam);
        toast.error(errObj.message || 'Login failed');
      } catch {
        toast.error('Login failed');
      }
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const Mentor  = await account.createEmailPasswordSession(user.email, user.password);
      setIsLoggedIn(true);
      toast.success('Logged in successfully!');
      console.log(Mentor);
      navigate(`/mentorsdashboard/${Mentor.userId}`);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };
  if(loading){
    return <MoodMigoLoading/>
  }
  return (
    <>
      <div className="mb-12">
        <Navbar />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
        <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-5xl">
          {/* Illustration */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-500 items-center justify-center p-10 relative">
            {/* Mascot */}
            <img
              src="/Mascot_2.png"
              alt="login illustration"
              className="w-full max-w-sm animate-float"
            />

            {/* Speech Bubble - Adjusted for better positioning and tail */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white text-purple-700 text-center text-base font-medium px-6 py-3 rounded-3xl shadow-lg max-w-xs z-10">
              Welcome back! Sign in to continue 🚀
              {/* Little "tail" for the speech bubble, pointing towards the mascot */}
<div
  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0
  border-l-[10px] border-r-[10px] border-t-[10px]
  border-l-transparent border-r-transparent border-t-white"
/>

            </div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                MoodMigo
              </h1>
              <h2 className="mt-3 text-2xl font-semibold text-gray-800">
                Login to your Account
              </h2>
              <p className="text-gray-500 text-md mt-1">Empower lives through mindful mentorship</p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
            >
              {showForm ? 'Hide Email/Password Login' : 'Login with Email/Password'}
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}