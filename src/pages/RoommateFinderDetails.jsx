import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import { useAuth } from "../Context/AuthContext";
import { FiHeart, FiShare2, FiFlag, FiChevronLeft } from "react-icons/fi";
import ReportComponent from "../components/ReportComponent";
import { MessageButton } from "../components/MessageButton";
import { BsWhatsapp } from "react-icons/bs";

const RoommateFinderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roommate, setRoommate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchRoommate = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "roommateFinder" && _id == $id][0]{
          _id,
          title,
          description,
          roommatePreferences,
          budget,
          location,
          contactInfo,
          images,
          postedBy->{
            _id,
            fullName,
            profileImage,
            phone,
            uid
          },
          isActive,
          accommodationType,
          createdAt,
          updatedAt
        }`;
        const data = await client.fetch(query, { id });
        if (!data) {
          throw new Error("Roommate request not found");
        }
        setRoommate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoommate();
  }, [id]);

  const toggleWishlist = () => {
    if (!roommate) return;
    const updatedWishlist = wishlist.includes(roommate._id)
      ? wishlist.filter(i => i !== roommate._id)
      : [...wishlist, roommate._id];
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Roommate Finder: ${roommate.title}`,
        text: roommate.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <Link to="/roommate-finder" className="text-purple-600 hover:underline">
          Browse other roommate requests
        </Link>
      </div>
    );
  }

  if (!roommate) return null;

  return (
    <div className="container mx-auto px-4 py-12 pt-20 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            {roommate.images?.length > 0 ? (
              <>
                <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in">
                  <img
                    src={urlFor(roommate.images[currentImageIndex]).width(800).url()}
                    alt={roommate.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                      className={`p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${wishlist.includes(roommate._id) ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors`}
                      aria-label={wishlist.includes(roommate._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart className={`w-5 h-5 ${wishlist.includes(roommate._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-purple-500 transition-colors"
                      aria-label="Share roommate request"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                      aria-label="Report roommate request"
                    >
                      <FiFlag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {roommate.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {roommate.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-purple-500' : 'border-transparent'}`}
                      >
                        <img
                          src={urlFor(image).width(100).url()}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                No images available
              </div>
            )}
          </div>
          {/* Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{roommate.title}</h1>
              <span className="text-2xl font-bold text-purple-600">
                {roommate.budget ? `₹${roommate.budget}` : 'No budget set'}
              </span>
            </div>
            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {roommate.accommodationType?.replace('-', ' ').replace('pg', 'PG').replace('flat', 'Flat/Apartment').replace('college hostel', 'College Hostel')}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {roommate.roommatePreferences?.gender ? `Prefers ${roommate.roommatePreferences.gender}` : 'Any gender'}
              </span>
            </div>
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{roommate.description}</p>
            </div>
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Gender</span>
                <span className="text-gray-900">{roommate.roommatePreferences?.gender || 'Any'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Age Range</span>
                <span className="text-gray-900">{roommate.roommatePreferences?.ageRange || 'Any'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Other Preferences</span>
                <span className="text-gray-900">{roommate.roommatePreferences?.otherPreferences || 'None'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Status</span>
                <span className={roommate.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                  {roommate.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            {/* Profile Card */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Posted By</h3>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {roommate.postedBy?.profileImage ? (
                  <img
                    src={roommate.postedBy.profileImage.asset ? urlFor(roommate.postedBy.profileImage).width(60).url() : roommate.postedBy.profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    {(roommate.postedBy?.fullName || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{roommate.postedBy?.fullName || 'Anonymous'}</p>
                  {roommate.postedBy?.phone && (
                    <a
                      href={`tel:${roommate.postedBy.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {roommate.postedBy.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Chat & WhatsApp Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <MessageButton product={{
                ...roommate,
                seller: {
                  ...roommate.postedBy,
                  uid: roommate.postedBy?.uid,
                  phone: roommate.postedBy?.phone,
                  fullName: roommate.postedBy?.fullName,
                  profileImage: roommate.postedBy?.profileImage
                }
              }} />
            </div>
            <div className="mb-2 text-xs text-gray-400">
              Posted on {new Date(roommate.createdAt).toLocaleDateString()} | Last updated {new Date(roommate.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      {showReport && (
        <ReportComponent
          type="roommateFinder"
          id={roommate._id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default RoommateFinderDetails; 