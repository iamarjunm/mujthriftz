import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiClock, FiUser, FiEye } from "react-icons/fi";
import { FaRupeeSign, FaExchangeAlt, FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import { urlFor } from "../sanityClient";

const ProductCard = ({ 
  item, 
  type = 'product', // 'product', 'borrow', or 'request'
  isInWishlist = false,
  onToggleWishlist = () => {},
  getProductAge = () => "New",
  formatRentalRate = () => "",
  getPriceRangeLabel = () => ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced price display with animations
  const getPriceDisplay = () => {
    switch(type) {
      case 'borrow':
        if (item.rentalRate) {
          const durationMap = { hour: "hr", day: "day", week: "wk", month: "mo" };
          return (
            <motion.span 
              key="borrow-price"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <FaRupeeSign className="mr-0.5" />
              {item.rentalRate.amount?.toLocaleString()}
              <span className="text-xs ml-1">/{durationMap[item.rentalRate.duration]}</span>
            </motion.span>
          );
        }
        return "Rate not specified";
      case 'request':
        return (
          <motion.span 
            key="request-price"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {getPriceRangeLabel(item.priceRange)}
          </motion.span>
        );
      default:
        return item.price ? (
          <motion.span 
            key="product-price"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <FaRupeeSign className="mr-0.5" />
            {item.price.toLocaleString()}
          </motion.span>
        ) : "Price not set";
    }
  };

  // Dynamic styling with more visual impact
  const getTypeStyles = () => {
    const baseStyles = {
      product: {
        badge: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
        button: 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700',
        ribbon: 'from-purple-500 to-indigo-600',
        tagIcon: <FaRupeeSign />
      },
      borrow: {
        badge: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        button: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
        ribbon: 'from-blue-500 to-cyan-600',
        tagIcon: <FaExchangeAlt />
      },
      request: {
        badge: item.requestType === 'buy' 
          ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white' 
          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
        button: 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700',
        ribbon: item.requestType === 'buy' ? 'from-pink-500 to-rose-600' : 'from-blue-500 to-cyan-600',
        tagIcon: item.requestType === 'buy' ? <FaRupeeSign /> : <FaExchangeAlt />
      }
    };
    return baseStyles[type] || baseStyles.product;
  };

  const styles = getTypeStyles();
  const priceDisplay = getPriceDisplay();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Hot Deal Ribbon */}
      {item.isHotDeal && (
        <div className={`absolute top-0 right-4 w-24 h-8 bg-gradient-to-r ${styles.ribbon} text-white text-xs font-bold flex items-center justify-center transform rotate-45 translate-x-2 -translate-y-1 z-10 shadow-md`}>
          <FaFire className="mr-1" /> HOT DEAL
        </div>
      )}

      {/* Image Section with Parallax Effect */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {item.images?.[0] ? (
          <motion.img
            src={urlFor(item.images[0]).width(600).height(450).url()}
            alt={item.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Floating Price Tag */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-sm font-bold flex items-center ${type === 'product' ? 'text-purple-600' : 'text-gray-800'}`}
        >
          {styles.tagIcon && (
            <motion.span className="mr-1">
              {styles.tagIcon}
            </motion.span>
          )}
          {priceDisplay}
        </motion.div>

        {/* Wishlist Button with Animation */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all ${
            isInWishlist ? "bg-red-500/90 text-white shadow-lg" : "bg-white/90 text-gray-500 hover:text-red-500"
          } shadow-sm z-10`}
        >
          <FiHeart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Title with hover effect */}
        <Link 
          to={`/${type === 'request' ? 'request' : 'product'}/${item._id}`}
          className="group"
        >
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 leading-tight transition-colors group-hover:text-purple-600">
            {item.title}
          </h3>
        </Link>

        {/* Seller/Requester Info with Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-sm text-gray-500 mb-3"
        >
          <div className="p-1.5 bg-gray-100 rounded-full">
            <FiUser className="w-3 h-3" />
          </div>
          <span className="truncate">
            {item.isAnonymous
              ? item.anonymousName || "Anonymous"
              : (type === 'request' ? item.requestedBy?.fullName : item.seller?.fullName)?.split(' ')[0] || 
                (type === 'request' ? "Requester" : "Seller")}
          </span>
        </motion.div>

        {/* Additional Info Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center"
          >
            <FiClock className="mr-1" />
            {type === 'request' ? new Date(item._createdAt).toLocaleDateString() : getProductAge(item.productAge)}
          </motion.span>
          
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
          >
            {item.condition === 'any' ? 'Any condition' : item.condition}
          </motion.span>
        </div>

        {/* Category Badge */}
        <div className="mt-auto">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className={`text-xs ${styles.badge} px-3 py-1.5 rounded-full inline-flex items-center`}
          >
            {item.category?.replace(/^[^\w]+/, '')}
          </motion.span>
        </div>
      </div>

      {/* View Button with Glow Effect */}
      <div className="px-5 pb-5">
        <Link
          to={`/${type === 'request' ? 'request' : 'product'}/${item._id}`}
          className={`w-full flex items-center justify-center ${styles.button} text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-${type === 'product' ? 'purple' : type === 'borrow' ? 'green' : 'indigo'}-500/30`}
        >
          <FiEye className="w-5 h-5 mr-2" />
          {type === 'request' ? 'View Request' : 'View Details'}
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;