import React from "react";
import { FiSearch } from "react-icons/fi";

const SortSearchBar = ({ searchQuery, setSearchQuery, sortOption, setSortOption, resultCount }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div className="flex items-center gap-2 w-full md:w-1/2">
      <div className="relative w-full">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
        />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <select
        value={sortOption}
        onChange={e => setSortOption(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
      <span className="text-xs text-gray-500 ml-2">{resultCount} results</span>
    </div>
  </div>
);

export default SortSearchBar; 