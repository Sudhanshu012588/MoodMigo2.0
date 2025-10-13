import {  FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#f6f8fc] text-gray-700 pt-12 pb-6 px-6 md:px-24 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        
        {/* Logo and Tagline */}
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-purple-700">MoodMigo</h2>
          <p className="mt-2">
            Supporting your mental health journey through professional guidance and community.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-purple-700">Home</a></li>
            <li><a href='/mentorspage' className='hover:text-purple-700'>Mentor's Page</a></li>

            <li><a href="#" className="hover:text-purple-700">About Us</a></li>
            <li><a href="#" className="hover:text-purple-700">Services</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Services</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-purple-700">Online Counseling</a></li>
            <li><a href="#" className="hover:text-purple-700">Journal</a></li>
            <li><a href="#" className="hover:text-purple-700">MANARAH Chatbot</a></li>
            <li><a href="#" className="hover:text-purple-700">Community</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="mb-1">shriyajain1011@gmail.com

</p>
          <p className="mb-3"></p>
          <div className="flex space-x-4 text-xl text-purple-600">
            
            <a href="https://www.instagram.com/moodmigo/"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t pt-4 text-center text-sm text-gray-500">
        © 2025 MoodMigo. All rights reserved.
      </div>
    </footer>
  );
}
