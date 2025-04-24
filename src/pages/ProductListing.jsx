import React, { useState, useEffect } from "react";
import { client } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const conditions = ["new", "like-new", "good", "fair", "poor"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "productListing" && isAvailable == true && listingType == "sell"]{
          _id,
          title,
          description,
          category,
          condition,
          price,
          productAge,
          images,
          isAnonymous,
          anonymousName,
          seller->{
            _id,
            fullName,
            profileImage
          },
          tags,
          _createdAt
        }`;
        const data = await client.fetch(query);
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    let results = [...products];

    // Apply search filter
    if (searchQuery) {
      results = results.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    // Apply condition filter
    if (selectedConditions.length > 0) {
      results = results.filter(product => 
        selectedConditions.includes(product.condition)
      );
    }

    // Apply price range filter
    results = results.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch(sortOption) {
      case "newest":
        results.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a._createdAt) - new Date(b._createdAt));
        break;
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(results);
  }, [products, searchQuery, selectedCategories, selectedConditions, priceRange, sortOption]);

  const toggleWishlist = (productId) => {
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const getProductAge = (productAge) => {
    if (!productAge) return "New";
    const { years, months } = productAge;
    if (years === 0 && months === 0) return "New";
    if (years === 0) return `${months}mo`;
    if (months === 0) return `${years}yr`;
    return `${years}yr ${months}mo`;
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedConditions([]);
    setPriceRange([0, 10000]);
    setSortOption("newest");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
          🛍️ Campus Marketplace
        </h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create Listing Button */}
          <button
            onClick={() => navigate('/create-listing')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
          >
            <FiPlus />
            <span className="hidden sm:inline">Create Listing</span>
          </button>

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
            <h3 className="text-lg font-semibold">Filter Products</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range Filter */}
            <div>
              <h4 className="font-medium mb-2">Price Range (₹)</h4>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span>to</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
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
                      {condition.replace('-', ' ')}
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
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              item={product}
              type="product"
              isInWishlist={wishlist.includes(product._id)}
              onToggleWishlist={() => toggleWishlist(product._id)}
              getProductAge={getProductAge}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-lg mb-4">No products match your filters</div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;