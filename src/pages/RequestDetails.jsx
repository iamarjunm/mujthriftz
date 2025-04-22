import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import { useAuth } from "../Context/AuthContext";
import { FiHeart, FiShare2, FiMessageSquare, FiFlag, FiChevronLeft } from "react-icons/fi";
import { RequestButton } from "../components/RequestButton";
import ReportComponent from "../components/ReportComponent";
import { toast } from "react-toastify";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "requestProduct" && _id == $id][0]{
          _id,
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
          requestedBy->{
            _id,
            fullName,
            profileImage,
            phone,
            uid
          },
          location,
          tags,
          _createdAt,
          isActive,
          urgency
        }`;
        const data = await client.fetch(query, { id });
        if (!data) {
          throw new Error("Request not found");
        }
        setRequest(data);
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(err.message);
        toast.error("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const toggleWishlist = () => {
    if (!request) return;
    
    const updatedWishlist = wishlist.includes(request._id)
      ? wishlist.filter(id => id !== request._id)
      : [...wishlist, request._id];
    
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    
    toast.success(
      wishlist.includes(request._id) 
        ? "Removed from your wishlist" 
        : "Added to your wishlist"
    );
  };

  const getProductAge = (productAge) => {
    if (!productAge) return "No preference";
    const { years, months } = productAge;
    if (years === 0 && months === 0) return "New only";
    if (years === 0) return `Under ${months} month${months > 1 ? 's' : ''}`;
    if (months === 0) return `Under ${years} year${years > 1 ? 's' : ''}`;
    return `Under ${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  const getPriceRangeLabel = (priceRange) => {
    const ranges = {
      'under-500': 'Under ₹500',
      '500-1000': '₹500 - ₹1,000',
      '1000-2000': '₹1,000 - ₹2,000',
      '2000-5000': '₹2,000 - ₹5,000',
      '5000-10000': '₹5,000 - ₹10,000',
      'over-10000': 'Over ₹10,000',
      'negotiable': 'Negotiable'
    };
    return ranges[priceRange] || priceRange;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this request: ${request.title}`,
        text: request.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <Link 
          to="/requests" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <FiChevronLeft className="mr-1" />
          Browse other requests
        </Link>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-7xl">
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

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            {request.images?.length > 0 ? (
              <>
                <div 
                  className="relative h-96 bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in"
                  onClick={() => setIsImageFullscreen(true)}
                >
                  <img
                    src={urlFor(request.images[currentImageIndex]).width(800).url()}
                    alt={request.title}
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist();
                      }}
                      className={`p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${
                        wishlist.includes(request._id) ? 'text-red-500' : 'text-gray-600'
                      } hover:text-red-500 transition-colors`}
                      aria-label={wishlist.includes(request._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart className={`w-5 h-5 ${wishlist.includes(request._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-purple-500 transition-colors"
                      aria-label="Share request"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReport(true);
                      }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                      aria-label="Report request"
                    >
                      <FiFlag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {request.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {request.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                        }`}
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
              <div className="relative h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="mt-2 text-gray-500">No reference images provided</p>
                </div>
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{request.title}</h1>
              <span className="text-2xl font-bold text-purple-600">
                {getPriceRangeLabel(request.priceRange)}
              </span>
            </div>

            {/* Urgency Badge */}
            {request.urgency && (
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.urgency === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : request.urgency === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.urgency === 'high' ? 'Urgent' : request.urgency === 'medium' ? 'Priority' : 'Standard'}
                </span>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {request.category}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {request.requestType}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {request.condition}
              </span>
              {request.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{request.description}</p>
            </div>

            {/* Request Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Max Product Age</span>
                <span className="text-gray-900">{getProductAge(request.productAge)}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Posted On</span>
                <span className="text-gray-900">{formatDate(request._createdAt)}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Request Type</span>
                <span className="text-gray-900 capitalize">{request.requestType}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Status</span>
                <span className={request.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                  {request.isActive ? "Active" : "Fulfilled"}
                </span>
              </div>
            </div>

            {/* Requester Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Requester Information</h3>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {request.requestedBy?.profileImage ? (
                  <img
                    src={urlFor(request.requestedBy.profileImage).width(60).url()}
                    alt="Requester"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    {request.isAnonymous 
                      ? (request.anonymousName || "A").charAt(0).toUpperCase()
                      : (request.requestedBy?.fullName || "R").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {request.isAnonymous
                      ? request.anonymousName || "Anonymous Requester"
                      : request.requestedBy?.fullName || "Requester"}
                  </p>
                  {request.requestedBy?.phone && !request.isAnonymous && (
                    <a 
                      href={`tel:${request.requestedBy.phone}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {request.requestedBy.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Request Button - Integrated with full functionality */}
            {request && (
              <div className="mt-6">
                <RequestButton request={request} />
              </div>
            )}
          </div>
        </div>

        {/* Location (if available) */}
        {request.location && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Preferred Location</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {/* Replace with actual map component */}
              <p className="text-gray-500">
                Location: {request.location.lat}, {request.location.lng}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && request.images?.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsImageFullscreen(false)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={urlFor(request.images[currentImageIndex]).url()}
              alt={request.title}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageFullscreen(false);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <ReportComponent 
          onClose={() => setShowReport(false)}
          reportedItem={request}
          reportedItemType="request"
        />
      )}
    </div>
  );
};

export default RequestDetails;