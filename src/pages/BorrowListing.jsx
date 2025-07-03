import React, { useState, useEffect } from "react";
import { client } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import HeroSection from '../components/HeroSection';
import FiltersSidebar from '../components/FiltersSidebar';
import SortSearchBar from '../components/SortSearchBar';
import ActiveFiltersChips from '../components/ActiveFiltersChips';
import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';

const BorrowListing = () => {
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
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
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

  const conditions = ["new", "like-new", "good", "fair", "poor"];
  const durations = ["hour", "day", "week", "month"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "productListing" && isAvailable == true && listingType == "lend"]{
          _id,
          title,
          description,
          category,
          condition,
          rentalRate,
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

    // Apply duration filter
    if (selectedDurations.length > 0) {
      results = results.filter(product => 
        product.rentalRate?.duration && selectedDurations.includes(product.rentalRate.duration)
      );
    }

    // Apply price range filter
    results = results.filter(product => 
      product.rentalRate?.amount >= priceRange[0] && product.rentalRate?.amount <= priceRange[1]
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
        results.sort((a, b) => (a.rentalRate?.amount || 0) - (b.rentalRate?.amount || 0));
        break;
      case "price-high":
        results.sort((a, b) => (b.rentalRate?.amount || 0) - (a.rentalRate?.amount || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(results);
  }, [products, searchQuery, selectedCategories, selectedConditions, selectedDurations, priceRange, sortOption]);

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

  const formatRentalRate = (rate) => {
    if (!rate) return "Rate not specified";
    const durationMap = {
      hour: "hr",
      day: "day",
      week: "wk",
      month: "mo"
    };
    return `₹${rate.amount?.toLocaleString()}/${durationMap[rate.duration] || rate.duration}`;
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

  const toggleDuration = (duration) => {
    setSelectedDurations(prev => 
      prev.includes(duration) 
        ? prev.filter(d => d !== duration) 
        : [...prev, duration]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedDurations([]);
    setPriceRange([0, 1000]);
    setSortOption("newest");
  };

  const filtersApplied = selectedCategories.length > 0 || selectedConditions.length > 0 || selectedDurations.length > 0 || searchQuery || priceRange[0] !== 0 || priceRange[1] !== 1000;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <HeroSection
        title="Products for Borrow"
        subtitle="Borrow textbooks, electronics, and more from fellow MUJ students for short or long term!"
        ctaText="Create Listing"
        ctaLink="/create-listing"
        illustration="borrow"
      />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 sm:px-4 py-8">
        <FiltersSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          conditions={conditions}
          selectedConditions={selectedConditions}
          onToggleCondition={toggleCondition}
          durations={durations}
          selectedDurations={selectedDurations}
          onToggleDuration={toggleDuration}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          resetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
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
            selectedDurations={selectedDurations}
            priceRange={priceRange}
            onRemoveCategory={toggleCategory}
            onRemoveCondition={toggleCondition}
            onRemoveDuration={toggleDuration}
            onReset={resetFilters}
          />
          {loading ? (
            <ProductGrid loading count={8} />
          ) : error ? (
            <EmptyState message={error} onRetry={() => window.location.reload()} />
          ) : filteredProducts.length === 0 ? (
            <EmptyState message="No rentals match your filters." />
          ) : (
            <ProductGrid
              products={filteredProducts}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              getProductAge={getProductAge}
              formatRentalRate={formatRentalRate}
              type="borrow"
            />
          )}
        </main>
        </div>
    </div>
  );
};

export default BorrowListing;