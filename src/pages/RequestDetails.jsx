import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import useAuth from "../utils/useAuth";
import { FiHeart, FiShare2, FiMessageSquare } from "react-icons/fi";
import { RequestButton } from "../components/MessageButton"

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
            phone
          },
          location,
          tags,
          _createdAt,
          isActive
        }`;
        const data = await client.fetch(query, { id });
        if (!data) {
          throw new Error("Request not found");
        }
        setRequest(data);
      } catch (err) {
        console.error("Error fetching request:", err);
        setError(err.message);
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
    switch(priceRange) {
      case 'under-500': return 'Under ₹500';
      case '500-1000': return '₹500 - ₹1000';
      case '1000-2000': return '₹1000 - ₹2000';
      case '2000-5000': return '₹2000 - ₹5000';
      case '5000-10000': return '₹5000 - ₹10000';
      case 'over-10000': return 'Over ₹10000';
      case 'negotiable': return 'Negotiable';
      default: return priceRange;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: request.title,
        text: request.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContactRequester = () => {
    if (!user) {
      navigate('/login', { state: { from: `/requests/${id}` } });
      return;
    }
    // Implement contact logic
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
        <Link to="/requests" className="text-purple-600 hover:underline">
          Browse other requests
        </Link>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="container mx-auto px-4 py-12 pt-20">
      <div className="mb-6">
        <Link 
          to="/request" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Requests
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            {request.images?.length > 0 ? (
              <>
                <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={urlFor(request.images[currentImageIndex]).width(800).url()}
                    alt={request.title}
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={toggleWishlist}
                      className={`p-2 rounded-full bg-white/80 backdrop-blur-sm ${
                        wishlist.includes(request._id) ? 'text-red-500' : 'text-gray-400'
                      } hover:text-red-500 transition-colors`}
                      aria-label={wishlist.includes(request._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart className={`w-5 h-5 ${wishlist.includes(request._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-purple-500 transition-colors"
                      aria-label="Share request"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {request.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {request.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-purple-500' : 'border-transparent'
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
              <div className="relative h-96 bg-gray-100 rounded-lg flex items-center justify-center">
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
              <h1 className="text-2xl font-bold text-gray-800">{request.title}</h1>
              <span className="text-2xl font-bold text-purple-600">
                {getPriceRangeLabel(request.priceRange)}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {request.category}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {request.requestType}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {request.condition}
              </span>
              {request.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{request.description}</p>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-500">
              <div>
                <span className="block font-medium">Max Product Age:</span>
                <span>{getProductAge(request.productAge)}</span>
              </div>
              <div>
                <span className="block font-medium">Posted On:</span>
                <span>{new Date(request._createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block font-medium">Request Type:</span>
                <span className="capitalize">{request.requestType}</span>
              </div>
              <div>
                <span className="block font-medium">Status:</span>
                <span className={request.isActive ? "text-green-600" : "text-gray-400"}>
                  {request.isActive ? "Active" : "Fulfilled"}
                </span>
              </div>
            </div>

            {/* Requester Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Requester Information</h3>
              <div className="flex items-center gap-3">
                {request.requestedBy?.profileImage && (
                  <img
                    src={urlFor(request.requestedBy.profileImage).width(60).url()}
                    alt="Requester"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
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

            {/* Action Buttons */}
            <div className="flex gap-3">
            {request && <RequestButton request={request} />}
              <button className="flex-1 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-4 rounded-lg font-medium">
                I Can Help
              </button>
            </div>
          </div>
        </div>

        {/* Location (if available) */}
        {request.location && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Preferred Location</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Location: {request.location.lat}, {request.location.lng}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;