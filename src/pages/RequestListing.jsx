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

  const filtersApplied = selectedCategories.length > 0 || selectedConditions.length > 0 || selectedRequestTypes.length > 0 || selectedPriceRanges.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <HeroSection
        title="Requests"
        subtitle="Browse and respond to requests from MUJ students. Use filters to find requests you can fulfill!"
        ctaText="Create Request"
        ctaLink="/create-request"
        illustration="request"
        colorTheme="pink-orange"
      />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 sm:px-4 py-8">
        {/* Mobile Filters Button */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold shadow hover:bg-pink-700 transition"
            onClick={() => setShowFilters(true)}
            aria-label="Show Filters"
          >
            <FiFilter className="text-lg" /> Filters
          </button>
          <span className="text-sm text-gray-500">{filteredRequests.length} results</span>
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
            requestTypes={requestTypes}
            selectedRequestTypes={selectedRequestTypes}
            onToggleRequestType={toggleRequestType}
            priceRanges={priceRanges}
            selectedPriceRanges={selectedPriceRanges}
            onTogglePriceRange={togglePriceRange}
            resetFilters={resetFilters}
            showFilters={true}
            setShowFilters={setShowFilters}
            colorTheme="pink-orange"
          />
        </div>
        {/* Filters Overlay (mobile) */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 md:hidden">
            <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 mx-2">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-pink-600 p-2"
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
                requestTypes={requestTypes}
                selectedRequestTypes={selectedRequestTypes}
                onToggleRequestType={toggleRequestType}
                priceRanges={priceRanges}
                selectedPriceRanges={selectedPriceRanges}
                onTogglePriceRange={togglePriceRange}
                resetFilters={resetFilters}
                showFilters={true}
                setShowFilters={setShowFilters}
                colorTheme="pink-orange"
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
            resultCount={filteredRequests.length}
          />
          <ActiveFiltersChips
            selectedCategories={selectedCategories}
            selectedConditions={selectedConditions}
            selectedRequestTypes={selectedRequestTypes}
            selectedPriceRanges={selectedPriceRanges}
            onRemoveCategory={toggleCategory}
            onRemoveCondition={toggleCondition}
            onRemoveRequestType={toggleRequestType}
            onRemovePriceRange={togglePriceRange}
            onReset={resetFilters}
          />
          {loading ? (
            <ProductGrid loading count={8} type="request" />
          ) : error ? (
            <EmptyState message={error} onRetry={() => window.location.reload()} />
          ) : filteredRequests.length === 0 ? (
            <EmptyState message="No requests match your filters." />
          ) : (
            <ProductGrid
              products={filteredRequests}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              getProductAge={getProductAge}
              getPriceRangeLabel={getPriceRangeLabel}
              type="request"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default RequestListing;