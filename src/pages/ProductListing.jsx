import React, { useState, useEffect } from "react";
import { client } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch, FiPlus } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import HeroSection from '../components/HeroSection';
import FiltersSidebar from '../components/FiltersSidebar';
import SortSearchBar from '../components/SortSearchBar';
import ActiveFiltersChips from '../components/ActiveFiltersChips';
import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';

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
  const [maxPrice, setMaxPrice] = useState(10000);
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
        // Set max price dynamically
        const prices = data.map(p => p.price || 0);
        const max = prices.length > 0 ? Math.max(...prices) : 10000;
        setMaxPrice(max);
        setPriceRange([0, max]);
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
    setPriceRange([0, maxPrice]);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <HeroSection
        title="Products for Sale"
        subtitle="Discover great deals on textbooks, electronics, furniture, and more from fellow MUJ students!"
        ctaText="Create Listing"
        ctaLink="/create-listing"
        illustration="product"
      />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 sm:px-4 py-8">
        {/* Mobile Filters Button */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
            onClick={() => setShowFilters(true)}
            aria-label="Show Filters"
          >
            <FiFilter className="text-lg" /> Filters
          </button>
          <span className="text-sm text-gray-500">{filteredProducts.length} results</span>
        </div>
        {/* Filters Sidebar (desktop) */}
        <div className="hidden md:block">
          <FiltersSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            conditions={conditions}
            selectedConditions={selectedConditions}
            onToggleCondition={toggleCondition}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            resetFilters={resetFilters}
            showFilters={true}
            setShowFilters={setShowFilters}
            maxPrice={maxPrice}
          />
      </div>
        {/* Filters Overlay (mobile) */}
      {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 md:hidden">
            <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 mx-2">
            <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-purple-600 p-2"
                onClick={() => setShowFilters(false)}
                aria-label="Close Filters"
            >
                <FiX className="text-xl" />
            </button>
              <FiltersSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                conditions={conditions}
                selectedConditions={selectedConditions}
                onToggleCondition={toggleCondition}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                resetFilters={resetFilters}
                showFilters={true}
                setShowFilters={setShowFilters}
                maxPrice={maxPrice}
              />
          </div>
        </div>
      )}
        <main className="flex-1 min-w-0">
          <SortSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            resultCount={filteredProducts.length}
          />
          <ActiveFiltersChips
            selectedCategories={selectedCategories}
            selectedConditions={selectedConditions}
            priceRange={priceRange}
            onRemoveCategory={toggleCategory}
            onRemoveCondition={toggleCondition}
            onReset={resetFilters}
          />
          {loading ? (
            <ProductGrid loading count={8} />
          ) : error ? (
            <EmptyState message={error} onRetry={() => window.location.reload()} />
          ) : filteredProducts.length === 0 ? (
            <EmptyState message="No products match your filters." />
          ) : (
            <ProductGrid
              products={filteredProducts}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              getProductAge={getProductAge}
            />
          )}
        </main>
        </div>
    </div>
  );
};

export default ProductListing;