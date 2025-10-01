import { motion } from "framer-motion";
import {useNavigate} from 'react-router-dom'
import { account } from "../Appwrite/config";
function HeroSection() {
  const navigator=useNavigate()
  return (
    <section className="relative bg-gradient-to-b from-purple-50 to-white min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Background Wave SVG */}
      <motion.div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-0"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 1440 320"
          className="
            w-screen h-auto
            scale-[20] sm:scale-[1.5] md:scale-100 md:scale-[3] lg:scale-[1.5] xl:scale-[1.5]
            origin-bottom
          "
        >
          <path
            fill="#e6e9f6"
            d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,229.3C840,213,960,139,1080,122.7C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center max-w-6xl w-full gap-10 lg:gap-12">
        {/* Text Content */}
        <motion.div
          className="text-center lg:text-left flex-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-snug">
            <span className="text-purple-600">Your Mental Health Journey</span>
            <br />
            <span className="text-gray-800">Starts Here</span>
          </h1>
          <p className="mt-4 sm:mt-0 text-sm sm:text-base lg:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
            MoodMigo connects you with professional psychiatrists and a supportive
            community to guide you through your mental wellness journey.
          </p>
          <motion.div
            className="mt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <button
            onClick={()=>{
              account.get().then((res)=>{
                if(res.$id){navigator('/dashboard')}
                else{navigator('/signup')}
              }).catch(()=>{navigator('/signup')})
              }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl shadow-lg transition duration-300 w-full sm:w-auto">
              Get Started
            </button>
            <button
              onClick={()=>{
              account.get().then((res)=>{
                if(res.$id){navigator('/dashboard')}
                else{navigator('/login')}
              }).catch(()=>{navigator('/login')})
              }}
            className="border border-purple-600 text-purple-600 font-semibold py-3 px-6 sm:px-8 rounded-xl hover:bg-purple-50 transition duration-300 w-full sm:w-auto">
              I Already Have an Account
            </button>
          </motion.div>
        </motion.div>

        {/* Illustration / Image */}
        <motion.div
          className="flex-1 flex justify-center lg:justify-end relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <motion.img
              src="/Illustration.png"
              alt="illustration"
              className="w-[250px] sm:w-[350px] md:w-[450px] lg:w-[550px] xl:w-[650px] sm:top-0 object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
