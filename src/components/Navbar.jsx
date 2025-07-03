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
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Only close mobile menu if the click is outside and it's currently open
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Check if the click target is NOT the hamburger/X icon itself
        const menuButton = document.querySelector('[aria-label="Open menu"], [aria-label="Close menu"]');
        if (menuButton && menuButton.contains(event.target)) {
            return; // Don't close if the click was on the toggle button
        }
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]); // Depend on isMobileMenuOpen to re-evaluate the event listener

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
    // When mobile menu closes, also ensure body scrolling is re-enabled
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
    // Cleanup on unmount
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none ${
                location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                  ? 'text-purple-700 font-medium bg-purple-50' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              {link.label}
              {(location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))) && (
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

        {/* User Actions & Mobile Toggle */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Icons Container */}
              <div className="flex items-center space-x-1">
                {/* Inbox Icon */}
                <motion.div whileHover={{ scale: 1.1 }} className="relative">
                  <Link 
                    to="/inbox" 
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-purple-100 transition-colors"
                    aria-label="Inbox"
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
                    aria-label="Wishlist"
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

                {/* Create Button (Desktop/Large Screen) */}
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

              {/* User Profile Dropdown (Desktop) */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-1 py-1 rounded-full transition-all duration-200 focus:outline-none ${
                    isDropdownOpen ? 'bg-purple-100' : 'hover:bg-purple-50'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User Profile Menu"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
                    {fullName ? fullName.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <span className="hidden lg:inline-block font-medium text-gray-700">
                    {fullName || "Profile"}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
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
                        role="menuitem"
                      >
                        <FiUserCheck className="mr-3 text-purple-600" />
                        My Profile
                      </Link>
                      <Link
                        to="/manage-listings"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FiList className="mr-3 text-purple-600" />
                        My Listings
                      </Link>
                      <Link
                        to="/manage-requests"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FiList className="mr-3 text-purple-600" />
                        My Requests
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <Link
                        to="/create-listing"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FiPlusCircle className="mr-3 text-purple-600" />
                        New Listing
                      </Link>
                      <Link
                        to="/create-request"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FiEdit3 className="mr-3 text-purple-600" />
                        New Request
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <Link
                        to="/create-roommate-request"
                        className="flex items-center px-4 py-3 hover:bg-purple-50 text-gray-700 transition-colors text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FiPlusCircle className="mr-3 text-purple-600" />
                        Create Roommate Request
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 transition-colors text-sm"
                        role="menuitem"
                      >
                        <FiLogOut className="mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : ( // User NOT logged in
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

      {/* Mobile Menu Content & Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40" // z-40 is below menu (z-50)
              onClick={() => setIsMobileMenuOpen(false)} // Click overlay to close
            />

            {/* Mobile Menu */}
            <motion.div
              ref={mobileMenuRef}
              id="mobile-menu"
              initial={{ y: "-100%" }} // Start from above the screen
              animate={{ y: "0%" }}    // Slide down to cover screen
              exit={{ y: "-100%" }}    // Slide back up on exit
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 w-screen h-screen bg-white overflow-y-auto shadow-2xl z-50 py-4" // fixed position, full screen
            >
              <div className="flex justify-end px-4 py-2">
                 <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-600 hover:text-purple-700 p-2"
                    aria-label="Close menu"
                 >
                    <FiX className="text-2xl" />
                 </motion.button>
              </div>

              <div className="px-4 pb-4">
                {/* Mobile Search Bar */}
                <div className="mb-4 relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Main Navigation Links for Mobile */}
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg mb-1 text-base font-medium ${
                      location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user && (
                  <>
                    <div className="border-t border-gray-100 my-3"></div>
                    {/* Create Buttons - prominent at the top of mobile menu */}
                    <Link
                      to="/create-listing"
                      className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold mb-2 text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create New Listing
                    </Link>
                    <Link
                      to="/create-request"
                      className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold mb-2 text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create New Request
                    </Link>
                    <Link
                      to="/create-roommate-request"
                      className="block w-full text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold mb-2 text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Roommate Request
                    </Link>

                    <div className="border-t border-gray-100 my-3"></div>

                    {/* User-specific Nav Links with Icons */}
                    <Link
                      to="/inbox"
                      className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-base ${
                        location.pathname.includes('/inbox') 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiMessageSquare className="mr-3 text-lg" />
                      My Messages
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/wishlist"
                      className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-base ${
                        location.pathname.includes('/wishlist') 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiHeart className="mr-3 text-lg" />
                      My Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {wishlistCount > 9 ? '9+' : wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-base ${
                        location.pathname.includes('/profile') 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiUserCheck className="mr-3 text-lg" />
                      My Profile
                    </Link>
                    <Link
                      to="/manage-listings"
                      className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-base ${
                        location.pathname.includes('/manage-listings') 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiList className="mr-3 text-lg" />
                      My Listings
                    </Link>
                    <Link
                      to="/manage-requests"
                      className={`block px-4 py-3 rounded-lg mb-1 flex items-center text-base ${
                        location.pathname.includes('/manage-requests') 
                          ? 'bg-purple-100 text-purple-700 font-medium' 
                          : 'text-gray-700 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiList className="mr-3 text-lg" />
                      My Requests
                    </Link>
                    
                    <div className="border-t border-gray-100 my-3"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 rounded-lg mb-1 text-red-600 font-medium text-base hover:bg-red-50 flex items-center"
                    >
                      <FiLogOut className="mr-3 text-lg" />
                      Logout
                    </button>
                  </>
                )}
                
                {!user && (
                  <>
                    <div className="border-t border-gray-100 my-3"></div>
                    <Link
                      to="/login"
                      className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold mt-2 text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login / Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;