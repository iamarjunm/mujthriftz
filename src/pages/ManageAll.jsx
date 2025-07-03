import React, { useState, useEffect } from 'react';
import { useAuth } from "../Context/AuthContext";
import { client, urlFor } from '../sanityClient';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiTrash2, FiEdit, FiCheckCircle, FiX, FiLoader, FiShoppingBag, FiPlusCircle, FiUser, FiHome } from 'react-icons/fi';
import { FaRegSadTear } from 'react-icons/fa';

// --- ManageListings Section ---
const ManageListingsSection = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        if (!user?.uid) return;
        const userQuery = `*[_type == "userProfile" && uid == $uid][0]{ _id }`;
        const sanityUser = await client.fetch(userQuery, { uid: user.uid });
        if (!sanityUser?._id) return setListings([]);
        const listingsQuery = `*[_type == "productListing" && seller._ref == $userId && isAvailable == true] | order(_createdAt desc) { _id, title, price, rentalRate, listingType, condition, images, isAvailable, _createdAt }`;
        const data = await client.fetch(listingsQuery, { userId: sanityUser._id });
        setListings(data || []);
      } catch (err) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  const handleMarkAsSold = async (id) => {
    setDeletingId(id);
    try {
      await client.patch(id).set({ isAvailable: false }).commit();
      setListings(prev => prev.filter(item => item._id !== id));
      toast.success("Listing marked as sold!");
    } catch {
      toast.error("Failed to mark as sold");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-purple-700"><FiShoppingBag /> Manage Your Listings</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-6 h-80 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
          <FaRegSadTear className="text-4xl text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No active listings found</h3>
          <Link to="/create-listing" className="mt-4 inline-flex items-center px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition-all"><FiShoppingBag className="mr-2" />Create Listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing._id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col">
              <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {listing.images?.[0] ? <img src={urlFor(listing.images[0]).width(400).url()} alt={listing.title} className="object-cover w-full h-full" /> : <FiShoppingBag className="text-4xl text-gray-300" />}
              </div>
              <h4 className="font-semibold text-lg mb-1">{listing.title}</h4>
              <div className="text-sm text-gray-500 mb-2">{listing.price ? `₹${listing.price}` : listing.rentalRate ? `₹${listing.rentalRate.amount}/${listing.rentalRate.duration}` : ''}</div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleMarkAsSold(listing._id)} disabled={deletingId === listing._id} className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-semibold">{deletingId === listing._id ? <FiLoader className="animate-spin" /> : <><FiCheckCircle className="mr-1" />Mark as Sold</>}</button>
                <Link to={`/product/${listing._id}`} className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold flex items-center justify-center"><FiEdit className="mr-1" />Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// --- ManageRequests Section ---
const ManageRequestsSection = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        if (!user?.uid) return;
        const userQuery = `*[_type == "userProfile" && uid == $uid][0]{ _id }`;
        const sanityUser = await client.fetch(userQuery, { uid: user.uid });
        if (!sanityUser?._id) return setRequests([]);
        const requestsQuery = `*[_type == "requestProduct" && requestedBy._ref == $userId && isActive == true] | order(_createdAt desc) { _id, title, description, category, requestType, priceRange, condition, images, isActive, _createdAt }`;
        const data = await client.fetch(requestsQuery, { userId: sanityUser._id });
        setRequests(data || []);
      } catch (err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const handleMarkAsFulfilled = async (id) => {
    setDeletingId(id);
    try {
      await client.patch(id).set({ isActive: false }).commit();
      setRequests(prev => prev.filter(item => item._id !== id));
      toast.success("Request marked as fulfilled!");
    } catch {
      toast.error("Failed to mark as fulfilled");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-amber-700"><FiPlusCircle /> Manage Your Requests</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-6 h-80 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl">
          <FaRegSadTear className="text-4xl text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No active requests found</h3>
          <Link to="/create-request" className="mt-4 inline-flex items-center px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-medium hover:shadow-lg transition-all"><FiPlusCircle className="mr-2" />Create Request</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            <div key={request._id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col">
              <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {request.images?.[0] ? <img src={urlFor(request.images[0]).width(400).url()} alt={request.title} className="object-cover w-full h-full" /> : <FiPlusCircle className="text-4xl text-gray-300" />}
              </div>
              <h4 className="font-semibold text-lg mb-1">{request.title}</h4>
              <div className="text-sm text-gray-500 mb-2">{request.category}</div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleMarkAsFulfilled(request._id)} disabled={deletingId === request._id} className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-semibold">{deletingId === request._id ? <FiLoader className="animate-spin" /> : <><FiCheck className="mr-1" />Mark as Fulfilled</>}</button>
                <Link to={`/request/${request._id}`} className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold flex items-center justify-center"><FiEdit className="mr-1" />Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// --- ManageRoommateFinderRequests Section ---
const ManageRoommateFinderRequestsSection = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        if (!user?.uid) return;
        const userQuery = `*[_type == "userProfile" && uid == $uid][0]{ _id }`;
        const sanityUser = await client.fetch(userQuery, { uid: user.uid });
        if (!sanityUser?._id) return setRequests([]);
        const requestsQuery = `*[_type == "roommateFinder" && postedBy._ref == $userId && isActive == true] | order(createdAt desc) { _id, title, description, budget, location, images, isActive, createdAt, updatedAt, accommodationType }`;
        const data = await client.fetch(requestsQuery, { userId: sanityUser._id });
        setRequests(data || []);
      } catch (err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const handleMarkAsInactive = async (id) => {
    setDeletingId(id);
    try {
      await client.patch(id).set({ isActive: false }).commit();
      setRequests(prev => prev.filter(item => item._id !== id));
      toast.success("Request marked as inactive!");
    } catch {
      toast.error("Failed to mark as inactive");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-teal-700"><FiHome /> Manage Roommate Finder Requests</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-6 h-80 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-br from-teal-50 to-green-50 rounded-3xl">
          <FaRegSadTear className="text-4xl text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No active roommate requests found</h3>
          <Link to="/create-roommate-request" className="mt-4 inline-flex items-center px-5 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-full font-medium hover:shadow-lg transition-all"><FiHome className="mr-2" />Create Roommate Request</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            <div key={request._id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col">
              <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {request.images?.[0] ? <img src={urlFor(request.images[0]).width(400).url()} alt={request.title} className="object-cover w-full h-full" /> : <FiHome className="text-4xl text-gray-300" />}
              </div>
              <h4 className="font-semibold text-lg mb-1">{request.title}</h4>
              <div className="text-sm text-gray-500 mb-2">{request.accommodationType}</div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleMarkAsInactive(request._id)} disabled={deletingId === request._id} className="flex-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-semibold">{deletingId === request._id ? <FiLoader className="animate-spin" /> : <><FiCheckCircle className="mr-1" />Mark as Inactive</>}</button>
                <Link to={`/roommate-finder/${request._id}`} className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold flex items-center justify-center"><FiEdit className="mr-1" />Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// --- Main Combined Management Page ---
const ManageAll = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <ManageListingsSection />
        <ManageRequestsSection />
        <ManageRoommateFinderRequestsSection />
      </div>
    </motion.div>
  );
};

export default ManageAll; 