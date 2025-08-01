import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrolled = (threshold: number = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If not on home page, always show scrolled state
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    }

    // Reset to false for home page
    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, threshold]);

  return isScrolled;
};
