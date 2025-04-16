import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiEdit, FiCheck, FiX, FiLoader, FiPlusCircle } from 'react-icons/fi';
import { FaRegSadTear, FaSearch } from 'react-icons/fa';
import { client, urlFor } from '../sanityClient';
import useAuth from '../utils/useAuth';
import { toast } from 'react-hot-toast';

const ManageRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // FETCH USER REQUESTS
  useEffect(() => {
    const fetchRequests = async () => {
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
          setRequests([]);
          return;
        }

        // Fetch requests using the Sanity user ID
        const requestsQuery = `*[_type == "requestProduct" && requestedBy._ref == $userId && isActive == true] | order(_createdAt desc) {
          _id,
          title,
          description,
          category,
          requestType,
          priceRange,
          condition,
          images,
          isActive,
          _createdAt,
          "requesterName": requestedBy->fullName
        }`;
        
        const data = await client.fetch(requestsQuery, { userId: sanityUser._id });
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        toast.error("Failed to load your requests");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  // MARK AS FULFILLED (SOFT DELETE)
  const handleMarkAsFulfilled = async (id) => {
    setDeletingId(id);
    try {
      await client
        .patch(id)
        .set({ isActive: false })
        .commit();
      
      setRequests(prev => prev.filter(item => item._id !== id));
      toast.success("Request marked as fulfilled!");
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error("Failed to mark as fulfilled");
    } finally {
      setDeletingId(null);
      setSelectedRequest(null);
    }
  };

  // HARD DELETE
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await client.delete(id);
      setRequests(prev => prev.filter(item => item._id !== id));
      toast.success("Request deleted permanently!");
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error("Failed to delete request");
    } finally {
      setDeletingId(null);
      setSelectedRequest(null);
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

  // CATEGORY EMOJI MAPPING
  const categoryEmoji = {
    textbooks: "📚",
    "lab-equipment": "🛠",
    electronics: "💻",
    furniture: "🪑",
    clothing: "👕",
    accessories: "🎒",
    "roommate-housing": "🏠",
    gaming: "🎮",
    vehicles: "🚲",
    "art-collectibles": "🎨",
    other: "🎭"
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
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            Manage Your Requests
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Track, edit, or mark as fulfilled your product/service requests
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
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
              <FaRegSadTear className="text-4xl text-amber-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">No active requests found</h3>
            <p className="text-gray-500 mt-2">You haven't made any requests yet</p>
            <Link
              to="/create-request"
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              <FiPlusCircle className="mr-2" />
              Create Your First Request
            </Link>
          </motion.div>
        ) : (
          <>
            {/* REQUESTS GRID */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {requests.map((request) => (
                  <motion.div
                    key={request._id}
                    variants={item}
                    layout
                    exit="exit"
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                  >
                    {/* IMAGE */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {request.images?.[0] ? (
                        <img
                          src={urlFor(request.images[0]).width(600).url()}
                          alt={request.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FaSearch className="text-4xl" />
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg truncate">{request.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {categoryEmoji[request.category] || '🎭'} {request.category.split('-').join(' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {request.requestType === 'buy' ? 'Want to Buy' : 'Want to Rent'}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {request.priceRange.replace('-', ' - ').replace('under-', 'Under ').replace('over-', 'Over ')}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {request.condition === 'any' ? 'Any Condition' : `Min: ${request.condition}`}
                        </span>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedRequest(request)}
                          disabled={deletingId === request._id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          {deletingId === request._id ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <>
                              <FiCheck />
                              Mark Fulfilled
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
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Your Request Analytics
                </span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { 
                    title: "Total Requests", 
                    value: requests.length,
                    color: "amber" 
                  },
                  { 
                    title: "Buy Requests", 
                    value: requests.filter(r => r.requestType === 'buy').length,
                    color: "blue" 
                  },
                  { 
                    title: "Rent Requests", 
                    value: requests.filter(r => r.requestType === 'rent').length,
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
        {selectedRequest && (
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
                <FiCheck className="text-green-500" />
                Confirm Mark as Fulfilled
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark <span className="font-semibold">"{selectedRequest.title}"</span> as fulfilled? 
                This will remove it from public view.
              </p>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="inline mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMarkAsFulfilled(selectedRequest._id)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all"
                >
                  <FiCheck className="inline mr-2" />
                  Confirm Fulfilled
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManageRequests;