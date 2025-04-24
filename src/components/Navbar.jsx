import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiUser, FiPlusCircle, FiLogOut, FiUserCheck, FiEdit3, FiMenu, FiX, FiList, FiMessageSquare } from "react-icons/fi";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {useAuth} from "../Context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || null);
          setWishlistCount(Array.isArray(data.wishlist) ? data.wishlist.length : 0);
          
          const unreadRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}/unread-count`);
          if (unreadRes.ok) {
            const unreadData = await unreadRes.json();
            setUnreadCount(unreadData.count || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

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
        <Link to="/" className="flex items-center focus:outline-none min-w-[200px] h-20 overflow-visible">
          <motion.img
            src="https://cdn.sanity.io/images/gcb0j4e6/production/f9454f84a8ab73f533ff6bd0972c91a41d06e3c9-1024x1024.png"
            alt="MUJ Thriftz Logo"
            className="w-full object-cover"
            style={{ 
              height: '80px',
              maxWidth: '300px',
              minWidth: '200px',
              objectPosition: 'center center'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            priority
          />
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
              {/* Inbox Icon - Only shown on desktop */}
              <motion.div whileHover={{ scale: 1.1 }} className="hidden md:block">
                <Link to="/inbox" className="relative group mr-2">
                  <FiMessageSquare className="text-gray-600 text-2xl transition-colors group-hover:text-blue-600" />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Wishlist Icon - Visible on all devices */}
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
                      to="/manage-listings"
                      className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiList className="mr-3 text-purple-600" />
                      Manage Listings
                    </Link>
                    <Link
                      to="/manage-requests"
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
            <>
              <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-bold hover:shadow-lg transition-all shadow-purple-200"
                >
                  Login / Sign Up
                </Link>
              </motion.div>
          
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
                <Link
                  to="/inbox"
                  className={`block px-4 py-3 rounded-lg mb-1 flex items-center ${location.pathname === '/inbox' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FiMessageSquare className="mr-3" />
                  My Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
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
