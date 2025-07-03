import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiUser } from "react-icons/fi"; // Only need these here now
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../Context/AuthContext";

// Import the new components
import DesktopNavLinks from "./Navbar/DesktopNavLinks";
import UserActionIcons from "./Navbar/UserActionIcons";
import UserProfileDropdown from "./Navbar/UserProfileDropdown";
import MobileMenu from "./Navbar/MobileMenu";

const Navbar = () => {
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for mobile search

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading || !user?.uid) {
        setLoadingUserData(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || null);
          setWishlistCount(Array.isArray(data.wishlist) ? data.wishlist.length : 0);

          if (import.meta.env.VITE_API_URL) {
            const unreadRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/unread-count`);
            if (unreadRes.ok) {
              const unreadData = await unreadRes.json();
              setUnreadCount(unreadData.count || 0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Ensure all related UI states are reset on logout
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close desktop dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Close mobile menu if click is outside the menu AND not on the toggle button
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const menuButton = document.querySelector('[aria-label="Open menu"], [aria-label="Close menu"]');
        if (menuButton && menuButton.contains(event.target)) {
            return;
        }
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Close mobile menu and re-enable body scroll when navigating
    setIsMobileMenuOpen(false);
    if (document.body.classList.contains('overflow-hidden')) {
      document.body.classList.remove('overflow-hidden');
    }
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: "/products", label: "Buy & Sell" },
    { path: "/borrow", label: "Borrow & Lend" },
    { path: "/request", label: "Request" },
    { path: "/roommate-finder", label: "Roommate Finder" },
    { path: "/contact", label: "Contact" }
  ];

  if (authLoading || loadingUserData) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white/95 backdrop-blur-md shadow-sm rounded-b-xl px-4 py-1 flex items-center justify-between z-50 sticky top-0 border-b border-gray-100"
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-2 sm:px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center focus:outline-none min-w-[160px] h-16 overflow-visible">
          <motion.img
            src="https://cdn.sanity.io/images/gcb0j4e6/production/8be522aefa72638cc3ed9934a6c105e756b1868d-1500x1500.png"
            alt="MUJ Thriftz Logo"
            className="w-full object-cover"
            style={{
              height: '64px',
              maxWidth: '160px',
              minWidth: '64px',
              objectPosition: 'center center'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <DesktopNavLinks navLinks={navLinks} />

        {/* User Actions & Mobile Toggle */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <UserActionIcons
                wishlistCount={wishlistCount}
                unreadCount={unreadCount}
              />
              <UserProfileDropdown
                fullName={fullName}
                user={user}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                dropdownRef={dropdownRef}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <>
              {/* Login/Sign Up Button (Desktop) */}
              <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-md transition-all shadow-purple-200/50 text-sm"
                >
                  Login / Sign Up
                </Link>
              </motion.div>

              {/* Login Icon (Mobile for not logged in) */}
              <motion.div whileHover={{ scale: 1.05 }} className="md:hidden">
                <Link
                  to="/login"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  aria-label="Login"
                >
                  <FiUser className="text-xl" />
                </Link>
              </motion.div>
            </>
          )}

          {/* Mobile Menu Button (Hamburger/X icon) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-purple-700 p-2 ml-1"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        navLinks={navLinks}
        user={user}
        unreadCount={unreadCount}
        wishlistCount={wishlistCount}
        onLogout={handleLogout}
      />
    </motion.nav>
  );
};

export default Navbar;