import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiCheckCircle, FiX, FiLoader, FiShoppingBag } from 'react-icons/fi';
import { FaRegSadTear, FaFire } from 'react-icons/fa';
import { client, urlFor } from '../sanityClient';
import useAuth from '../utils/useAuth';
import { toast } from 'react-hot-toast';

const ManageListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  // PROPERLY FETCH USER LISTINGS
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        if (!user?.uid) return;

        // First get the user's Sanity ID from Firebase UID
        const userQuery = `*[_type == "userProfile" && uid == $uid][0]{
          _id,
          fullName
        }`;
        
        const sanityUser = await client.fetch(userQuery, { uid: user.uid });
        
        if (!sanityUser?._id) {
          toast.error("User profile not found");
          setListings([]);
          return;
        }

        // Now fetch listings using the Sanity user ID
        const listingsQuery = `*[_type == "productListing" && seller._ref == $userId && isAvailable == true] | order(_createdAt desc) {
          _id,
          title,
          price,
          rentalRate,
          listingType,
          condition,
          images,
          isAvailable,
          _createdAt,
          "sellerName": seller->fullName
        }`;
        
        const data = await client.fetch(listingsQuery, { userId: sanityUser._id });
        setListings(data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
        toast.error("Failed to load your listings");
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  // MARK AS SOLD (SOFT DELETE)
  const handleMarkAsSold = async (id) => {
    setDeletingId(id);
    try {
      await client
        .patch(id)
        .set({ isAvailable: false })
        .commit();
      
      setListings(prev => prev.filter(item => item._id !== id));
      toast.success("Listing marked as sold!");
    } catch (err) {
      console.error("Error updating listing:", err);
      toast.error("Failed to mark as sold");
    } finally {
      setDeletingId(null);
      setSelectedListing(null);
    }
  };

  // HARD DELETE (OPTIONAL)
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await client.delete(id);
      setListings(prev => prev.filter(item => item._id !== id));
      toast.success("Listing deleted permanently!");
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error("Failed to delete listing");
    } finally {
      setDeletingId(null);
      setSelectedListing(null);
    }
  };

  // ANIMATION VARIANTS
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Manage Your Listings
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Edit, mark as sold, or track performance of your active listings
          </p>
        </motion.div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 h-80 animate-pulse"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <FaRegSadTear className="text-4xl text-purple-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">No active listings found</h3>
            <p className="text-gray-500 mt-2">You haven't listed any items yet</p>
            <Link
              to="/create-listing"
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              <FiShoppingBag className="mr-2" />
              Create Your First Listing
            </Link>
          </motion.div>
        ) : (
          <>
            {/* LISTINGS GRID */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {listings.map((listing) => (
                  <motion.div
                    key={listing._id}
                    variants={item}
                    layout
                    exit="exit"
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                  >

                    {/* IMAGE */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img
                          src={urlFor(listing.images[0]).width(600).url()}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FiShoppingBag className="text-4xl" />
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg truncate">{listing.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {listing.condition}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <span>
                          {listing.listingType === 'sell' 
                            ? `₹${listing.price?.toLocaleString('en-IN') ?? 'N/A'}` 
                            : listing.rentalRate 
                              ? `₹${listing.rentalRate.amount?.toLocaleString('en-IN')}/${listing.rentalRate.duration}`
                              : 'N/A'}
                        </span>
                        <span>•</span>
                        <span>{new Date(listing._createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedListing(listing)}
                          disabled={deletingId === listing._id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          {deletingId === listing._id ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <>
                              <FiCheckCircle />
                              Mark Sold
                            </>
                          )}
                        </motion.button>

                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* STATS DASHBOARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="font-bold text-xl mb-5 flex items-center">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Listing Analytics
                </span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { 
                    title: "Total Listings", 
                    value: listings.length,
                    color: "purple" 
                  },
                  { 
                    title: "For Sale", 
                    value: listings.filter(l => l.listingType === 'sell').length,
                    color: "blue" 
                  },
                  { 
                    title: "For Rent", 
                    value: listings.filter(l => l.listingType === 'lend').length,
                    color: "green" 
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className={`bg-${stat.color}-50 rounded-xl p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className={`text-${stat.color}-600 font-bold text-3xl mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.title}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200"
            >
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Confirm Mark as Sold
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark <span className="font-semibold">"{selectedListing.title}"</span> as sold? 
                This will remove it from public view.
              </p>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedListing(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="inline mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMarkAsSold(selectedListing._id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all"
                >
                  <FiCheckCircle className="inline mr-2" />
                  Confirm Sold
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageListings;