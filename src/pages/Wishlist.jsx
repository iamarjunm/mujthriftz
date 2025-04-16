import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiHeart, FiClock, FiUser, FiSearch, FiShoppingBag } from "react-icons/fi";
import { FaFire, FaRegHeart, FaHeart, FaRupeeSign } from "react-icons/fa";
import { urlFor } from "../sanityClient";
import useAuth from "../utils/useAuth";
import { client } from "../sanityClient";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user } = useAuth();

  // Fetch wishlist items from Sanity
  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        setLoading(true);
        const wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
        
        if (wishlistIds.length === 0) {
          setWishlistItems([]);
          return;
        }

        // Fetch both products and requests
        const query = `{
          "products": *[_type == "productListing" && _id in $wishlistIds]{
            _id,
            _type,
            title,
            description,
            category,
            listingType,
            price,
            rentalRate,
            productAge,
            condition,
            images,
            isAnonymous,
            anonymousName,
            seller->{_id, fullName, profileImage},
            tags,
            _createdAt
          },
          "requests": *[_type == "requestProduct" && _id in $wishlistIds]{
            _id,
            _type,
            title,
            description,
            category,
            requestType,
            priceRange,
            productAge,
            condition,
            images,
            isAnonymous,
            anonymousName,
            requestedBy->{_id, fullName, profileImage},
            tags,
            _createdAt
          }
        }`;
        
        const data = await client.fetch(query, { wishlistIds });
const combinedItems = [...data.products, ...data.requests];

// Maintain original order from localStorage and filter out undefined
const orderedItems = wishlistIds
  .map(id => combinedItems.find(item => item._id === id))
  .filter(item => item); // This removes any `undefined` if an ID wasn't found

setWishlistItems(orderedItems);

      } catch (err) {
        console.error("Error fetching wishlist items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  // Remove from Wishlist
  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item._id !== productId);
    setWishlistItems(updatedWishlist);
    
    // Update localStorage
    const wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];
    const updatedIds = wishlistIds.filter(id => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updatedIds));
  };

  // Toggle wishlist status (for the heart icon)
  const toggleWishlistStatus = (productId) => {
    removeFromWishlist(productId);
  };

  const getProductAge = (productAge) => {
    if (!productAge) return "New";
    const { years, months } = productAge;
    if (years === 0 && months === 0) return "New";
    if (years === 0) return `${months}mo`;
    if (months === 0) return `${years}yr`;
    return `${years}yr ${months}mo`;
  };

  const formatRentalRate = (rate) => {
    if (!rate) return null;
    const durationMap = {
      hour: "hr",
      day: "day",
      week: "wk",
      month: "mo"
    };
    return `₹${rate.amount?.toLocaleString()}/${durationMap[rate.duration] || rate.duration}`;
  };

  const getPriceRangeLabel = (value) => {
    const ranges = {
      "under-500": "Under ₹500",
      "500-1000": "₹500 - ₹1000",
      "1000-2000": "₹1000 - ₹2000",
      "2000-5000": "₹2000 - ₹5000",
      "5000-10000": "₹5000 - ₹10000",
      "over-10000": "Over ₹10000",
      "negotiable": "Negotiable"
    };
    return ranges[value] || value;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Your Wishlist Treasures
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {wishlistItems.length > 0 
            ? "Your curated collection of favorite items"
            : "Your wishlist is waiting to be filled with amazing finds"}
        </p>
      </motion.div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <FaRegHeart className="text-4xl text-pink-500" />
          </div>
          <p className="text-gray-500 text-lg mb-6">Your wishlist is currently empty</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FiShoppingBag /> Shop Products
            </Link>
            <Link
              to="/request"
              className="px-6 py-3 bg-white border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FiSearch /> Browse Requests
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => {
            const isRequest = item._type === "requestProduct";
            const isRental = !isRequest && item.listingType === "lend";

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                onHoverStart={() => setHoveredItem(item._id)}
                onHoverEnd={() => setHoveredItem(null)}
                className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100"
              >


                {/* Image section */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {item.images?.[0] ? (
                    <motion.img
                      src={urlFor(item.images[0]).width(600).height(450).url()}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1 }}
                      animate={{ scale: hoveredItem === item._id ? 1.1 : 1 }}
                      transition={{ duration: 0.5 }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      {isRequest ? (
                        <>
                          <FiSearch className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs opacity-70">Looking for this</span>
                        </>
                      ) : (
                        <FiShoppingBag className="w-10 h-10 opacity-50" />
                      )}
                    </div>
                  )}

                  {/* Floating Price/Rate */}
                  {!isRequest && (
                    <motion.div 
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-sm font-bold flex items-center"
                    >
                      <FaRupeeSign className="mr-1" />
                      {isRental 
                        ? formatRentalRate(item.rentalRate)
                        : `₹${item.price?.toLocaleString()}`}
                    </motion.div>
                  )}

                  {/* Wishlist button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWishlistStatus(item._id)}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all ${
                      true ? "bg-red-500/90 text-white shadow-lg" : "bg-white/90 text-gray-500 hover:text-red-500"
                    } shadow-sm z-10`}
                  >
                    <FaHeart className="w-5 h-5 fill-current" />
                  </motion.button>
                </div>

                {/* Content section */}
                <div className="p-5 flex-grow flex flex-col">
                  <Link 
                    to={isRequest ? `/request/${item._id}` : `/product/${item._id}`}
                    className="group"
                  >
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 leading-tight transition-colors group-hover:text-purple-600">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Owner/Requester */}
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
                        : (item.requestedBy || item.seller)?.fullName?.split(' ')[0] || 
                          (isRequest ? "Requester" : "Seller")}
                    </span>
                  </motion.div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center"
                    >
                      <FiClock className="mr-1" />
                      {isRequest 
                        ? item.condition === 'any' ? 'Any condition' : item.condition
                        : getProductAge(item.productAge)}
                    </motion.span>
                    
                    {isRequest && (
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center"
                      >
                        <FaRupeeSign className="mr-1" />
                        {getPriceRangeLabel(item.priceRange)}
                      </motion.span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mt-auto">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs bg-gradient-to-r ${
                        isRequest
                          ? "from-purple-500 to-indigo-600"
                          : isRental
                            ? "from-blue-500 to-cyan-600"
                            : "from-green-500 to-emerald-600"
                      } text-white px-3 py-1.5 rounded-full inline-flex items-center`}
                    >
                      {item.category?.replace(/^[^\w]+/, '')}
                    </motion.span>
                  </div>
                </div>

                {/* View button */}
                <div className="px-5 pb-5">
                  <Link
                    to={isRequest ? `/request/${item._id}` : `/product/${item._id}`}
                    className={`w-full flex items-center justify-center ${
                      isRequest
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                        : isRental
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                          : "bg-gradient-to-r from-gray-900 to-gray-800"
                    } text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-${
                      isRequest ? 'purple' : isRental ? 'blue' : 'gray'
                    }-500/30`}
                  >
                    {isRequest ? "View Request" : "View Details"}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;