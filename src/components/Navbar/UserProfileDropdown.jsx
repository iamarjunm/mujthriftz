import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiUserCheck, FiList, FiPlusCircle, FiEdit3, FiLogOut } from "react-icons/fi";

const UserProfileDropdown = ({ fullName, userEmail, isDropdownOpen, setIsDropdownOpen, handleLogout }) => {
  const dropdownRef = useRef(null);

  return (
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
                {userEmail}
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
  );
};

export default UserProfileDropdown;