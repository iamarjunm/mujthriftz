import React, { useState, useEffect } from "react";
import { client } from "../sanityClient";
import {useAuth} from "../Context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import HeroSection from '../components/HeroSection';
import FiltersSidebar from '../components/FiltersSidebar';
import SortSearchBar from '../components/SortSearchBar';
import ActiveFiltersChips from '../components/ActiveFiltersChips';
import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';

const RoommateFinder = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedGender, setSelectedGender] = useState("");
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [selectedAccommodation, setSelectedAccommodation] = useState("");
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "roommateFinder" && isActive == true]{
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
            profileImage
          },
          isActive,
          accommodationType,
          createdAt,
          updatedAt
        }`;
        const data = await client.fetch(query);
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error("Error fetching roommate requests:", err);
        setError("Failed to load roommate requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    let results = [...requests];
    if (searchQuery) {
      results = results.filter(request => 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedGender) {
      results = results.filter(request =>
        request.roommatePreferences?.gender === selectedGender
      );
    }
    if (selectedAccommodation) {
      results = results.filter(request =>
        request.accommodationType === selectedAccommodation
      );
    }
    results = results.filter(request => {
      const budget = parseInt(request.budget) || 0;
      return budget >= budgetRange[0] && budget <= budgetRange[1];
    });
    switch(sortOption) {
      case "newest":
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    setFilteredRequests(results);
  }, [requests, searchQuery, sortOption, selectedGender, selectedAccommodation, budgetRange]);

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

  const resetFilters = () => {
    setSearchQuery("");
    setSortOption("newest");
    setSelectedGender("");
    setBudgetRange([0, 20000]);
    setSelectedAccommodation("");
  };

  const filtersApplied = searchQuery || sortOption !== "newest";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      <HeroSection
        title="Roommate Finder"
        subtitle="Find or offer roommate opportunities. Use filters to find the perfect match!"
        ctaText="Create Roommate Request"
        ctaLink="/create-roommate-request"
        illustration="borrow"
        colorTheme="teal-green"
      />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-2 sm:px-4 py-8">
        <FiltersSidebar
          genderOptions={["male", "female", "any"]}
          selectedGender={selectedGender}
          onSelectGender={setSelectedGender}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
          accommodationOptions={["flat-apartment", "pg", "college-hostel"]}
          selectedAccommodation={selectedAccommodation}
          onSelectAccommodation={setSelectedAccommodation}
          resetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          colorTheme="teal-green"
        />
        <main className="flex-1 min-w-0">
          <SortSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
            resultCount={filteredRequests.length}
          />
          <ActiveFiltersChips
            selectedGender={selectedGender}
            budgetRange={budgetRange}
            selectedAccommodation={selectedAccommodation}
            onRemoveGender={() => setSelectedGender("")}
            onRemoveBudget={() => setBudgetRange([0, 20000])}
            onRemoveAccommodation={() => setSelectedAccommodation("")}
            onReset={resetFilters}
          />
          {loading ? (
            <ProductGrid loading count={8} type="roommate" />
          ) : error ? (
            <EmptyState message={error} onRetry={() => window.location.reload()} />
          ) : filteredRequests.length === 0 ? (
            <EmptyState message="No roommate requests match your filters." />
          ) : (
            <ProductGrid
              products={filteredRequests.map(r => ({ ...r, link: `/roommate-finder/${r._id}` }))}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              type="roommate"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default RoommateFinder; 