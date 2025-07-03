import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiUser, FiPlusCircle, FiLogOut, FiUserCheck, FiEdit3, FiMenu, FiX, FiList, FiMessageSquare, FiSearch } from "react-icons/fi";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fullName, setFullName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({});

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
    { path: "/roommate-finder", label: "Roommate Finder" },
    { path: "/contact", label: "Contact" }
  ];

  const userDropdownLinks = [
    { path: "/create-roommate-request", label: "Create Roommate Request", icon: FiPlusCircle },
  ];

  if (loading) return null;
  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white/95 backdrop-blur-md shadow-sm rounded-b-xl px-4 py-1 flex items-center justify-between z-50 sticky top-0 border-b border-gray-100"
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-2 sm:px-4">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none ${
                location.pathname.includes(link.path) 
                  ? 'text-purple-700 font-medium bg-purple-50' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              {link.label}
              {location.pathname.includes(link.path) && (
                <motion.span
                  layoutId="navUnderline"
                  className="absolute left-0 bottom-0 h-0.5 bg-purple-600 rounded-full"
                  style={{ width: '100%', transform: 'translateX(0)' }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {user && (
            <>
              {/* Icons Container */}
              <div className="flex items-center space-x-1">
                {/* Inbox Icon */}
                <motion.div whileHover={{ scale: 1.1 }} className="relative">
                  <Link 
                    to="/inbox" 
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    <FiMessageSquare className={`text-xl ${
                      location.pathname.includes('/inbox') 
                        ? 'text-purple-700' 
                        : 'text-gray-600'
                    }`} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>

                {/* Wishlist Icon */}
                <motion.div whileHover={{ scale: 1.1 }} className="relative">
                  <Link 
                    to="/wishlist" 
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    <FiHeart className={`text-xl ${
                      location.pathname.includes('/wishlist') 
                        ? 'text-purple-700' 
                        : 'text-gray-600'
                    }`} />
                    {wishlistCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]"
                      >
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>

                {/* Create Button */}
                <motion.div whileHover={{ scale: 1.05 }} className="hidden lg:block">
                  <Link
                    to="/create-listing"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:shadow-md transition-all shadow-purple-200/50 text-sm flex items-center gap-1"
                  >
                    <FiPlusCircle className="text-lg" />
                    <span>Create</span>
                  </Link>
                </motion.div>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-1 py-1 rounded-full transition-all duration-200 focus:outline-none ${
                    isDropdownOpen ? 'bg-purple-100' : 'hover:bg-purple-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
                    {fullName ? fullName.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  {!loading && (
                    <span className="hidden lg:inline-block font-medium text-gray-700">
                      {fullName || "Profile"}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100"
                    >
                      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <div className="text-sm font-medium px-2 truncate">
                          {fullName || "My Account"}
                        </div>
                        <div className="text-xs opacity-80 px-2 truncate">
                          {user?.email}
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiUserCheck className="mr-3 text-purple-600" />
                        My Profile
                      </Link>
                      <Link
                        to="/manage-listings"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiList className="mr-3 text-purple-600" />
                        My Listings
                      </Link>
                      <Link
                        to="/manage-requests"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiList className="mr-3 text-purple-600" />
                        My Requests
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <Link
                        to="/create-listing"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiPlusCircle className="mr-3 text-purple-600" />
                        New Listing
                      </Link>
                      <Link
                        to="/create-request"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiEdit3 className="mr-3 text-purple-600" />
                        New Request
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <Link
                        to="/create-roommate-request"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiPlusCircle className="mr-3 text-purple-600" />
                        Create Roommate Request
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 transition-colors text-sm"
                      >
                        <FiLogOut className="mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {!user && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-md transition-all shadow-purple-200/50 text-sm"
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
            className="md:hidden text-gray-600 hover:text-purple-700 p-2 ml-1"
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
            className="md:hidden w-full bg-white overflow-hidden border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg mb-1 text-sm ${
                    location.pathname.includes(link.path) 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
                      : 'text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/create-listing"
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium mb-2 text-sm"
                  >
                    Create New Listing
                  </Link>
                  <Link
                    to="/create-request"
                    className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium mb-2 text-sm"
                  >
                    Create New Request
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/inbox"
                    className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-sm ${
                      location.pathname.includes('/inbox') 
                        ? 'bg-purple-100 text-purple-700 font-medium' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <FiMessageSquare className="mr-3" />
                    My Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-sm ${
                      location.pathname.includes('/wishlist') 
                        ? 'bg-purple-100 text-purple-700 font-medium' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <FiHeart className="mr-3" />
                    My Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-sm ${
                      location.pathname.includes('/profile') 
                        ? 'bg-purple-100 text-purple-700 font-medium' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <FiUserCheck className="mr-3" />
                    My Profile
                  </Link>
                  <Link
                    to="/create-roommate-request"
                    className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-sm ${
                      location.pathname.includes('/create-roommate-request') 
                        ? 'bg-purple-100 text-purple-700 font-medium' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <FiPlusCircle className="mr-3" />
                    Create Roommate Request
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-lg mb-1 text-red-600 font-medium text-sm hover:bg-red-50"
                  >
                    <FiLogOut className="inline mr-3" />
                    Logout
                  </button>
                </>
              )}
              
              {!user && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/login"
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium mt-2 text-sm"
                  >
                    Login / Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;