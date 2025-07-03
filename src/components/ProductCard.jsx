import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiUser, FiClock, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "../sanityClient";

const ProductCard = ({ 
  item, 
  type = 'product',
  isInWishlist = false,
  onToggleWishlist = () => {},
  getProductAge = () => "New",
  formatRentalRate = () => "",
  getPriceRangeLabel = () => ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Minimal price display
  const getPriceDisplay = () => {
    switch(type) {
      case 'borrow':
        if (formatRentalRate && typeof formatRentalRate === 'function') {
          return formatRentalRate(item.rentalRate);
        }
        if (item.rentalRate) {
          const durationMap = { hour: "hr", day: "day", week: "wk", month: "mo" };
          return `₹${item.rentalRate.amount?.toLocaleString()}/${durationMap[item.rentalRate.duration]}`;
        }
        return "Rate not specified";
      case 'request':
        return getPriceRangeLabel(item.priceRange);
      case 'roommate':
        return item.budget && item.budget !== "" ? `Budget: ₹${item.budget}` : "Budget: Not set";
      default:
        return item.price ? `₹${item.price.toLocaleString()}` : "Price not set";
    }
  };

  // Avatar for roommate: postedBy.profileImage or initials; for others, use previous logic
  const getAvatar = () => {
    // Roommate: postedBy
    if (type === 'roommate' && item.postedBy) {
      if (item.postedBy.profileImage) {
        const imgUrl = item.postedBy.profileImage.asset ? urlFor(item.postedBy.profileImage).width(64).height(64).url() : item.postedBy.profileImage;
        return <img src={imgUrl} alt={item.postedBy.fullName || 'Profile'} className="w-6 h-6 rounded-full object-cover border" />;
      }
      const name = item.postedBy.fullName || "User";
      const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white">{initials}</div>;
    }
    // Request: requestedBy
    if (type === 'request' && item.requestedBy) {
      if (item.requestedBy.profileImage) {
        const imgUrl = item.requestedBy.profileImage.asset ? urlFor(item.requestedBy.profileImage).width(64).height(64).url() : item.requestedBy.profileImage;
        return <img src={imgUrl} alt={item.requestedBy.fullName || 'Profile'} className="w-6 h-6 rounded-full object-cover border" />;
      }
      const name = item.requestedBy.fullName || "User";
      const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white">{initials}</div>;
    }
    // Product: seller
    if (item.seller) {
      if (item.seller.profileImage) {
        const imgUrl = item.seller.profileImage.asset ? urlFor(item.seller.profileImage).width(64).height(64).url() : item.seller.profileImage;
        return <img src={imgUrl} alt={item.seller.fullName || 'Profile'} className="w-6 h-6 rounded-full object-cover border" />;
      }
      const name = item.seller.fullName || "User";
      const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white">{initials}</div>;
    }
    // Fallback
    return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500"><FiUser className="w-4 h-4" /></div>;
  };

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.035, boxShadow: "0 12px 32px 0 rgba(139,92,246,0.13)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(59,130,246,0.04) 100%)" }}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
        {item.images?.[0] ? (
          <motion.img
            src={urlFor(item.images[0]).width(600).height(450).url()}
            alt={item.title}
            className="w-full h-full object-cover border-2 border-white/60 rounded-b-xl transition-transform duration-300"
            style={{ boxShadow: isHovered ? '0 4px 32px 0 rgba(139,92,246,0.10)' : '', transform: isHovered ? 'scale(1.045)' : 'scale(1)' }}
            loading="lazy"
            whileHover={{ scale: 1.06 }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white/90 via-white/0 to-transparent pointer-events-none" />
        {/* Image ring */}
        <div className="absolute inset-0 pointer-events-none rounded-b-xl ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all" />
        {/* Price Tag */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full shadow-lg text-sm font-bold tracking-wide border-2 border-white/80">
          {getPriceDisplay()}
        </div>
        {/* Wishlist Button */}
        <motion.button
          onClick={e => { e.preventDefault(); onToggleWishlist(); setShowTooltip(true); setTimeout(() => setShowTooltip(false), 1200); }}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-500 hover:text-red-500 shadow transition-all ${isInWishlist ? 'text-red-500' : ''}`}
          whileTap={{ scale: 1.3 }}
          aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <FiHeart className="w-5 h-5" />
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg z-10"
              >
                {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        {type === 'roommate' && item.link ? (
          <Link to={item.link} className="group">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1 leading-tight transition-colors group-hover:text-purple-600">
              {item.title}
            </h3>
          </Link>
        ) : (
          <Link to={`/${type === 'request' ? 'request' : 'product'}/${item._id}`} className="group">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1 leading-tight transition-colors group-hover:text-purple-600">
              {item.title}
            </h3>
          </Link>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          {getAvatar()}
          <span className="truncate font-medium">
            {type === 'roommate' && item.postedBy
              ? item.postedBy.fullName?.split(' ')[0] || 'User'
              : type === 'request' && item.requestedBy
                ? item.requestedBy.fullName?.split(' ')[0] || 'User'
                : item.seller
                  ? item.seller.fullName?.split(' ')[0] || 'User'
                  : item.isAnonymous
                    ? item.anonymousName || "Anonymous"
                    : "User"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-semibold flex items-center gap-1">
            <FiClock className="inline-block mr-1 mb-0.5" />
            {type === 'request' ? new Date(item._createdAt).toLocaleDateString() : getProductAge(item.productAge)}
          </span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
            {item.condition === 'any' ? 'Any condition' : item.condition}
          </span>
          {item.category && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">
              {item.category.replace(/^[^\w]+/, '')}
            </span>
          )}
          {/* Show meta chips for roommate finder cards */}
          {type === 'roommate' && item.roommatePreferences?.gender && (
            <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded font-medium">
              {item.roommatePreferences.gender.charAt(0).toUpperCase() + item.roommatePreferences.gender.slice(1)}
            </span>
          )}
          {type === 'roommate' && item.accommodationType && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded font-medium">
              {item.accommodationType.replace(/-/g, ' ').replace('pg', 'PG').replace('flat', 'Flat/Apartment').replace('college hostel', 'College Hostel')}
            </span>
          )}
          {/* Show tags for roommate finder cards if present */}
          {type === 'roommate' && Array.isArray(item.tags) && item.tags.length > 0 && item.tags.map((tag, idx) => (
            <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="border-t border-gray-100 my-2" />
        <div className="mt-auto">
          {type === 'roommate' && item.link ? (
            <Link
              to={item.link}
              className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all"
            >
              <FiEye className="w-4 h-4 mr-1" />
              View Details
            </Link>
          ) : (
            <Link
              to={`/${type === 'request' ? 'request' : 'product'}/${item._id}`}
              className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all"
            >
              <FiEye className="w-4 h-4 mr-1" />
              {type === 'request' ? 'View Request' : 'View Details'}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Avoid nested <a> tags for roommate cards
  if (type === 'roommate' && item.link) {
    return CardContent;
  }
  return item.link ? <Link to={item.link}>{CardContent}</Link> : CardContent;
};

export default ProductCard;