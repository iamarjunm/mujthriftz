import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import { FiHeart, FiShare2, FiFlag, FiX } from "react-icons/fi";
import { MessageButton } from "../components/MessageButton";
import ReportComponent from "../components/ReportComponent";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "productListing" && _id == $id][0]{
          _id,
          title,
          description,
          category,
          condition,
          listingType,
          price,
          rentalRate,
          productAge,
          images,
          isAnonymous,
          anonymousName,
          seller->{
            _id,
            uid,
            fullName,
            profileImage,
            phone
          },
          location,
          tags,
          _createdAt,
          isAvailable
        }`;
        const data = await client.fetch(query, { id });
        if (!data) {
          throw new Error("Product not found");
        }
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const toggleWishlist = () => {
    if (!product) return;
    const updatedWishlist = wishlist.includes(product._id)
      ? wishlist.filter(id => id !== product._id)
      : [...wishlist, product._id];
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const getProductAge = (productAge) => {
    if (!productAge) return "Age not specified";
    const { years, months } = productAge;
    if (years === 0 && months === 0) return "New";
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch(err => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin bg-gradient-to-tr from-purple-400/30 to-white/60 shadow-xl"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <Link to="/products" className="text-purple-600 hover:underline">
          Browse other products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-12 pt-20 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/products" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <FiX className="w-5 h-5 mr-2" />
          Back
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            {product.images?.length > 0 ? (
              <>
                <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in">
                  <img
                    src={urlFor(product.images[currentImageIndex]).width(800).url()}
                    alt={product.title}
                    className="w-full h-full object-contain"
                    onClick={() => setZoomImage(true)}
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                      className={`p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${wishlist.includes(product._id) ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors`}
                      aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FiHeart className={`w-5 h-5 ${wishlist.includes(product._id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-purple-500 transition-colors"
                      aria-label="Share product"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                      aria-label="Report product"
                    >
                      <FiFlag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-purple-500' : 'border-gray-200'}`}
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
                  <p className="mt-2 text-gray-500">No product images provided</p>
                </div>
              </div>
            )}
          </div>
          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>
              <span className="text-2xl font-bold text-purple-600">
                {product.listingType === 'sell'
                  ? `₹${product.price?.toLocaleString()}`
                  : product.rentalRate?.amount
                  ? `₹${product.rentalRate.amount?.toLocaleString()} / ${product.rentalRate.duration}`
                  : ''}
              </span>
            </div>
            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.condition}
              </span>
              {product.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Product Age</span>
                <span className="text-gray-900">{getProductAge(product.productAge)}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Posted On</span>
                <span className="text-gray-900">{new Date(product._createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Listing Type</span>
                <span className="text-gray-900 capitalize">{product.listingType}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-sm font-medium text-gray-500 mb-1">Status</span>
                <span className={product.isAvailable ? "text-green-600 font-medium" : "text-gray-500"}>
                  {product.isAvailable ? "Available" : "Sold/Unavailable"}
                </span>
              </div>
            </div>
            {/* Seller Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Seller Information</h3>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {product.seller?.profileImage ? (
                  <img
                    src={urlFor(product.seller.profileImage).width(60).url()}
                    alt="Seller"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    {product.isAnonymous
                      ? (product.anonymousName || "A").charAt(0).toUpperCase()
                      : (product.seller?.fullName || "S").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {product.isAnonymous
                      ? product.anonymousName || "Anonymous Seller"
                      : product.seller?.fullName || "Seller"}
                  </p>
                  {product.seller?.phone && !product.isAnonymous && (
                    <a 
                      href={`tel:${product.seller.phone}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {product.seller.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Message Button */}
            {product.seller && !product.isAnonymous && (
              <div className="mt-6">
                <MessageButton product={product} />
              </div>
            )}
          </div>
        </div>
        {/* Location (if available) */}
        {product.location && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Location</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Location: {product.location.lat}, {product.location.lng}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Fullscreen Image Modal */}
      {zoomImage && product.images?.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(false)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={urlFor(product.images[currentImageIndex]).url()}
              alt={product.title}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setZoomImage(false);
              }}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReport && (
        <ReportComponent 
          onClose={() => setShowReport(false)}
          reportedItem={product}
          reportedItemType="listing"
        />
      )}
    </div>
  );
};

export default ProductDetails;