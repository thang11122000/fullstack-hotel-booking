import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import LoadingButton from "./LoadingButton";

// Constants
const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Hotels", path: "/rooms" },
] as const;

const SCROLL_THRESHOLD = 10;

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-gray-700"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { openSignIn } = useClerk();
  const location = useLocation();
  const { user, navigate, isOwner, setShowHotelReg, isLoading } =
    useAppContext();

  const isHomePage = location.pathname === "/";

  // Memoized event handlers
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleOwnerAction = useCallback(() => {
    if (isOwner) {
      navigate("/owner");
    } else {
      setShowHotelReg(true);
    }
  }, [isOwner, navigate, setShowHotelReg]);

  const handleMyBookingsClick = useCallback(() => {
    navigate("/my-bookings");
  }, [navigate]);

  const handleSignInClick = useCallback(() => {
    openSignIn();
  }, [openSignIn]);

  // Optimized scroll effect
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Memoized class names
  const navbarClasses = useMemo(() => {
    const baseClasses =
      "fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50";
    const scrolledClasses = isScrolled
      ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
      : "py-4 md:py-6";
    return `${baseClasses} ${scrolledClasses}`;
  }, [isScrolled]);

  const logoClasses = useMemo(
    () => `h-9 ${isScrolled ? "invert opacity-80" : ""}`,
    [isScrolled]
  );

  const textColorClass = isScrolled ? "text-gray-700" : "text-white";
  const borderColorClass = isScrolled ? "bg-gray-700" : "bg-white";

  // UserButton component to avoid duplication
  const UserButtonComponent = () => (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="My Bookings"
          labelIcon={<BookIcon />}
          onClick={handleMyBookingsClick}
        />
      </UserButton.MenuItems>
    </UserButton>
  );

  return (
    <nav className={navbarClasses}>
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="logo" className={logoClasses} />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {NAV_LINKS.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${textColorClass}`}
          >
            {link.name}
            <div
              className={`${borderColorClass} h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}
        {user && (
          <LoadingButton
            isLoading={isLoading}
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${textColorClass} transition-all`}
            onClick={handleOwnerAction}
          >
            {isOwner ? "Dashboard" : "My Bookings"}
          </LoadingButton>
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4 min-w-10">
        {user ? (
          <UserButtonComponent />
        ) : (
          <LoadingButton
            isLoading={isLoading}
            onClick={handleSignInClick}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 cursor-pointer ${
              isScrolled ? "text-white bg-black" : "bg-white text-black"
            }`}
          >
            Login
          </LoadingButton>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        {user && <UserButtonComponent />}
        <button
          onClick={handleMenuToggle}
          className={`${isScrolled ? "invert" : ""} h-4`}
          aria-label="Toggle menu"
        >
          <img src={assets.menuIcon} alt="menu" className="h-4" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={handleMenuClose}
          aria-label="Close menu"
        >
          <img src={assets.closeIcon} alt="close" className="h-6" />
        </button>

        {NAV_LINKS.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            onClick={handleMenuClose}
            className="hover:text-gray-600 transition-colors"
          >
            {link.name}
          </Link>
        ))}

        {user && (
          <button
            className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all hover:bg-gray-50"
            onClick={() => {
              handleOwnerAction();
              handleMenuClose();
            }}
          >
            {isOwner ? "Dashboard" : "My Bookings"}
          </button>
        )}

        {!user && (
          <button
            onClick={() => {
              handleSignInClick();
              handleMenuClose();
            }}
            className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500 hover:bg-gray-800 cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
