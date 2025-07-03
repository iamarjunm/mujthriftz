import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageSquare, FiHeart, FiUserCheck, FiList, FiLogOut, FiUser } from "react-icons/fi"; // FiSearch is removed

const MobileMenu = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  mobileMenuRef,
  // searchQuery, // Removed
  // setSearchQuery, // Removed
  navLinks,
  user,
  unreadCount,
  wishlistCount,
  onLogout,
}) => {
  const location = useLocation();

  const handleLogout = async () => {
    await onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu itself - slides in from top */}
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-screen h-screen bg-white overflow-y-auto overflow-x-hidden shadow-2xl z-50 py-3"
          >
            <div className="flex justify-end px-3 py-1 w-full max-w-full">
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

            <div className="px-3 pb-3 w-full max-w-full">
              {/* Mobile Search Bar - REMOVED */}
              {/* <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div> */}

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
  );
};

export default MobileMenu;