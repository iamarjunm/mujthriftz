import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { client, urlFor } from "../sanityClient";
import useAuth from "../utils/useAuth";
import { FiHeart, FiShare2, FiFlag } from "react-icons/fi";
import { MessageButton } from "../components/MessageButton";
import ReportComponent from "../components/ReportComponent"; // Import the ReportComponent

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
  const [showReport, setShowReport] = useState(false); // State for report modal

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
        console.error("Error fetching product:", err);
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
        <Link to="/products" className="text-purple-600 hover:underline">
          Browse other products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-12 pt-20">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/products" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
      </div>

      {/* Product content */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={urlFor(product.images[currentImageIndex]).width(800).url()}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full bg-white/80 backdrop-blur-sm ${
                    wishlist.includes(product._id) ? 'text-red-500' : 'text-gray-400'
                  } hover:text-red-500 transition-colors`}
                  aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FiHeart className={`w-5 h-5 ${wishlist.includes(product._id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Share product"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Report product"
                >
                  <FiFlag className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                {product.images.map((image, index) => (
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
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            {/* Title & Price */}
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
              {product.listingType === 'sell' ? (
                <span className="text-2xl font-bold text-purple-600">
                  ₹{product.price?.toLocaleString()}
                </span>
              ) : (
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{product.rentalRate?.amount?.toLocaleString()}
                  </span>
                  <span className="block text-sm text-gray-500">
                    per {product.rentalRate?.duration}
                    {product.rentalRate?.deposit > 0 && (
                      <span className="block">+ ₹{product.rentalRate?.deposit?.toLocaleString()} deposit</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {product.condition}
              </span>
              {product.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Product Age & Posted Date */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-500">
              <div>
                <span className="block font-medium">Product Age:</span>
                <span>{getProductAge(product.productAge)}</span>
              </div>
              <div>
                <span className="block font-medium">Posted On:</span>
                <span>{new Date(product._createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
              <div className="flex items-center gap-3">
                {product.seller?.profileImage && (
                  <img
                    src={urlFor(product.seller.profileImage).width(60).url()}
                    alt="Seller"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {product.seller && !product.isAnonymous && (
                <MessageButton product={product} />
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {product.location && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Location: {product.location.lat}, {product.location.lng}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Report Component */}
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