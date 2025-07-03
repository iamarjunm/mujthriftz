import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiMessageSquare, FiPlusCircle } from "react-icons/fi";

const UserActionIcons = ({ wishlistCount, unreadCount }) => {
  const location = useLocation();

  return (
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
  );
};

export default UserActionIcons;