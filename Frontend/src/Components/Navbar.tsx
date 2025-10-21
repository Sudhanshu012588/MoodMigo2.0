import React, { useEffect } from "react";
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  Home,
  Users,
  Info,
  UserPlus,
  BookText,
} from "lucide-react";
import { useUserState } from "../Store/Userstore";
import { account } from "../Appwrite/config";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const setIsLoggedIn = useUserState((state) => state.setIsLoggedIn);
  const isLoggedIn = useUserState((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    account
      .get()
      .then((res) => {
        if (res.$id) setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollTo = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      scrollToSection(id);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    account.deleteSession("current").then(() => {
      setIsLoggedIn(false);
      navigate("/login");
    });
  };

  const handleMoodMigoClick = () => {
    isLoggedIn ? navigate("/dashboard") : navigate("/");
  };

  // Dynamic links based on login state
  const navLinks = isLoggedIn
    ? [
        { name: "Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard") },
        { name: "Manarah", icon: Users, action: () => navigate("/manarah") },
        { name: "Blog", icon: BookText, action: () => navigate("/blog") },
        { name: "About", icon: Info, action: () => handleScrollTo("about") },
      ]
    : [
        { name: "Home", icon: Home, action: () => handleNavigate("/") },
        { name: "Services", icon: Users, action: () => handleScrollTo("services") },
        { name: "About", icon: Info, action: () => handleScrollTo("about") },
      ];

  return (
    <nav>
      {/* Desktop Navbar */}
      <div className="hidden md:flex fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md shadow-md rounded-2xl">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full">
          {/* Logo */}
          <div
            onClick={handleMoodMigoClick}
            className="cursor-pointer text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text transition-transform duration-200 hover:scale-[1.02]"
          >
            MoodMigo
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className="text-gray-700 font-medium hover:text-purple-600 transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ))}

            {/* Login / Logout */}
            <button
              onClick={() =>
                isLoggedIn ? handleLogout() : handleNavigate("/login")
              }
              className="text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>

            {/* Sign Up / Dashboard */}
            {!isLoggedIn && (
              <button
                onClick={() => handleNavigate("/signup")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-300"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <div className="flex justify-around items-center py-2 bg-white/30 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
              className="flex flex-col items-center text-gray-700 hover:text-purple-600 transition-colors text-xs"
            >
              <link.icon size={22} className="mb-0.5" />
              <span>{link.name}</span>
            </button>
          ))}

          {/* Login / Logout */}
          <button
            onClick={() =>
              isLoggedIn ? handleLogout() : handleNavigate("/login")
            }
            className="flex flex-col items-center text-gray-700 hover:text-purple-600 transition-colors text-xs"
          >
            {isLoggedIn ? <LogOut size={22} /> : <LogIn size={22} />}
            <span>{isLoggedIn ? "Logout" : "Login"}</span>
          </button>

          {/* Sign Up / Dashboard */}
          {!isLoggedIn && (
            <button
              onClick={() => handleNavigate("/signup")}
              className="flex flex-col items-center text-purple-600 hover:text-purple-800 transition-colors text-xs"
            >
              <UserPlus size={22} />
              <span>Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
