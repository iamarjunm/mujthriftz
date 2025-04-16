import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiUser, FiPlusCircle, FiLogOut, FiUserCheck, FiEdit3, FiMenu, FiX, FiList } from "react-icons/fi";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "../utils/useAuth";

const Navbar = () => {
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setFullName(docSnap.data().fullName);
            setWishlistCount(docSnap.data().wishlist?.length || 0);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setWishlistCount(0);
        setFullName(null);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/products", label: "Buy & Sell" },
    { path: "/borrow", label: "Borrow & Lend" },
    { path: "/request", label: "Request" },
    { path: "/contact", label: "Contact" }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full bg-white bg-opacity-95 border-b border-gray-200 z-50 shadow-sm backdrop-blur-lg"
    >
      <div className="container mx-auto flex justify-between items-center py-3 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            MUJ Thriftz
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`relative px-1 py-2 font-medium ${location.pathname.includes(link.path) ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              {link.label}
              {location.pathname.includes(link.path) && (
                <motion.span 
                  layoutId="navUnderline"
                  className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-600"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Wishlist Icon */}
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link to="/wishlist" className="relative group">
                  <FiHeart className="text-gray-600 text-2xl transition-colors group-hover:text-red-600" />
                  {wishlistCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            </>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  {fullName ? fullName.charAt(0).toUpperCase() : <FiUser />}
                </div>
                {!loading && (
                  <span className="hidden lg:inline-block font-medium">
                    {fullName || "Profile"}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 px-3 py-2">
                        {fullName || "My Account"}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiUserCheck className="mr-3 text-purple-600" />
                      My Profile
                    </Link>
                    <Link
                      to="/manage-listings" // NEW: Manage Listings Link
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiList className="mr-3 text-purple-600" />
                      Manage Listings
                    </Link>
                    <Link
                      to="/manage-requests" // NEW: Manage Listings Link
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiList className="mr-3 text-purple-600" />
                      Manage Requests
                    </Link>
                    <Link
                      to="/create-listing"
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiPlusCircle className="mr-3 text-purple-600" />
                      Create Listing
                    </Link>
                    <Link
                      to="/create-request"
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiEdit3 className="mr-3 text-purple-600" />
                      Create Request
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 transition-colors border-t border-gray-100"
                    >
                      <FiLogOut className="mr-3" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-bold hover:shadow-lg transition-all shadow-purple-200"
              >
                Login / Sign Up
              </Link>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-purple-700 p-2"
          >
            {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden w-full bg-white overflow-hidden"
          >
            <div className="px-4 py-2 border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg mb-1 ${location.pathname.includes(link.path) ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/manage-listings" // NEW: Mobile "Manage Listings"
                    className={`block px-4 py-3 rounded-lg mb-1 ${location.pathname.includes('/manage-listings') ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Manage Listings
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link
                    to="/manage-requests" // NEW: Mobile "Manage Listings"
                    className={`block px-4 py-3 rounded-lg mb-1 ${location.pathname.includes('/manage-listings') ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Manage Requests
                  </Link>
                </>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-bold mt-2"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;