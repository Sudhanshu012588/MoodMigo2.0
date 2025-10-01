import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import HeroSection from "../Components/HeroSection";
import ServicesSection from "../Components/Services";
import AboutPage from "../Components/About";
import Footer from "../Components/Footer";

function Homepage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <div>
      <Navbar />
      <div id="home">
        <HeroSection />
      </div>

      <div id="services">
        <ServicesSection />
      </div>

      <div id="about">
        <AboutPage />
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;
