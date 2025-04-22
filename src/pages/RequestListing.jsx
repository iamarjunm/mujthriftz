import React, { useState, useEffect } from "react";
import { client } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

const RequestListing = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const { user } = useAuth();

  // Available filter options
  const categories = [
    "textbooks",
    "lab-equipment",
    "electronics",
    "furniture",
    "clothing",
    "accessories",
    "gaming",
    "vehicles",
    "art-collectibles",
    "other"
  ];

  const conditions = ["new", "like-new", "good", "fair", "poor", "any"];
  const requestTypes = ["buy", "rent"];
  const priceRanges = [
    "under-500",
    "500-1000",
    "1000-2000",
    "2000-5000",
    "5000-10000",
    "over-10000",
    "negotiable"
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "requestProduct" && isActive == true]{
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
            profileImage
          },
          location,
          tags,
          _createdAt
        }`;
        const data = await client.fetch(query);
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    let results = [...requests];

    // Apply search filter
    if (searchQuery) {
      results = results.filter(request => 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.tags && request.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(request => 
        selectedCategories.includes(request.category)
      );
    }

    // Apply condition filter
    if (selectedConditions.length > 0) {
      results = results.filter(request => 
        selectedConditions.includes(request.condition)
      );
    }

    // Apply request type filter
    if (selectedRequestTypes.length > 0) {
      results = results.filter(request => 
        selectedRequestTypes.includes(request.requestType)
      );
    }

    // Apply price range filter
    if (selectedPriceRanges.length > 0) {
      results = results.filter(request => 
        selectedPriceRanges.includes(request.priceRange)
      );
    }

    // Apply sorting
    switch(sortOption) {
      case "newest":
        results.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a._createdAt) - new Date(b._createdAt));
        break;
      default:
        break;
    }

    setFilteredRequests(results);
  }, [requests, searchQuery, selectedCategories, selectedConditions, selectedRequestTypes, selectedPriceRanges, sortOption]);

  const toggleWishlist = (requestId) => {
    const updatedWishlist = wishlist.includes(requestId)
      ? wishlist.filter(id => id !== requestId)
      : [...wishlist, requestId];
    
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const getProductAge = (productAge) => {
    if (!productAge) return "Any age";
    const { years, months } = productAge;
    if (years === 0 && months === 0) return "New only";
    if (years === 0) return `Max ${months}mo`;
    if (months === 0) return `Max ${years}yr`;
    return `Max ${years}yr ${months}mo`;
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

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const toggleCondition = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition) 
        : [...prev, condition]
    );
  };

  const toggleRequestType = (type) => {
    setSelectedRequestTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range) 
        : [...prev, range]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedRequestTypes([]);
    setSelectedPriceRanges([]);
    setSortOption("newest");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          🔍 Product Requests
        </h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            <FiFilter />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filter Requests</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Request Type Filter */}
            <div>
              <h4 className="font-medium mb-2">Request Type</h4>
              <div className="space-y-2">
                {requestTypes.map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={selectedRequestTypes.includes(type)}
                      onChange={() => toggleRequestType(type)}
                      className="mr-2"
                    />
                    <label htmlFor={`type-${type}`} className="capitalize">
                      {type === 'buy' ? 'Want to Buy' : 'Want to Rent'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="mr-2"
                    />
                    <label htmlFor={`cat-${category}`} className="capitalize">
                      {category.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <h4 className="font-medium mb-2">Condition</h4>
              <div className="space-y-2">
                {conditions.map(condition => (
                  <div key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cond-${condition}`}
                      checked={selectedConditions.includes(condition)}
                      onChange={() => toggleCondition(condition)}
                      className="mr-2"
                    />
                    <label htmlFor={`cond-${condition}`} className="capitalize">
                      {condition === 'any' ? 'Any condition' : condition.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <div key={range} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`price-${range}`}
                      checked={selectedPriceRanges.includes(range)}
                      onChange={() => togglePriceRange(range)}
                      className="mr-2"
                    />
                    <label htmlFor={`price-${range}`}>
                      {getPriceRangeLabel(range)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Options */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRequests.map((request) => (
            <ProductCard
              key={request._id}
              item={request}
              type="request"
              isInWishlist={wishlist.includes(request._id)}
              onToggleWishlist={() => toggleWishlist(request._id)}
              getProductAge={getProductAge}
              getPriceRangeLabel={getPriceRangeLabel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-lg mb-4">No requests match your filters</div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestListing;