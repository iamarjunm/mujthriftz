import React from "react";

const FiltersSidebar = ({
  categories = [],
  selectedCategories = [],
  onToggleCategory = () => {},
  conditions = [],
  selectedConditions = [],
  onToggleCondition = () => {},
  priceRange = [0, 10000],
  setPriceRange = () => {},
  durations = [],
  selectedDurations = [],
  onToggleDuration = () => {},
  requestTypes = [],
  selectedRequestTypes = [],
  onToggleRequestType = () => {},
  priceRanges = [],
  selectedPriceRanges = [],
  onTogglePriceRange = () => {},
  resetFilters = () => {},
  showFilters = true,
  setShowFilters = () => {},
  genderOptions = [],
  selectedGender = "",
  onSelectGender = () => {},
  accommodationOptions = [],
  selectedAccommodation = "",
  onSelectAccommodation = () => {},
  budgetRange = [0, 20000],
  setBudgetRange = () => {},
  maxPrice = 10000
}) => {
  // Only show on desktop or if showFilters is true
  return (
    <aside className={`w-full md:w-64 md:sticky md:top-8 z-10 mb-8 md:mb-0 ${showFilters ? '' : 'hidden md:block'}`}>
      <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-700">Filters</h3>
          <button
            onClick={resetFilters}
            className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition font-semibold"
          >
            Clear All
          </button>
        </div>
        {categories.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedCategories.includes(category) ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-purple-50'}`}
                >
                  {category.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {conditions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Condition</h4>
            <div className="flex flex-wrap gap-2">
              {conditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => onToggleCondition(condition)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedConditions.includes(condition) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
                >
                  {condition.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {durations && durations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Rental Duration</h4>
            <div className="flex flex-wrap gap-2">
              {durations.map(duration => (
                <button
                  key={duration}
                  onClick={() => onToggleDuration(duration)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedDurations.includes(duration) ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50'}`}
                >
                  {duration.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {requestTypes && requestTypes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Request Type</h4>
            <div className="flex flex-wrap gap-2">
              {requestTypes.map(type => (
                <button
                  key={type}
                  onClick={() => onToggleRequestType(type)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedRequestTypes.includes(type) ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-pink-50'}`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {priceRanges && priceRanges.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Price Range</h4>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map(range => (
                <button
                  key={range}
                  onClick={() => onTogglePriceRange(range)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedPriceRanges.includes(range) ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-yellow-50'}`}
                >
                  {range.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Price slider for buy/borrow */}
        {setPriceRange && priceRange && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Price</h4>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <span>to</span>
              <input
                type="number"
                min={priceRange[0]}
                max={maxPrice}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="100"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-purple-600"
            />
          </div>
        )}
        {/* Roommate-specific filters */}
        {genderOptions && genderOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Preferred Gender</h4>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map(gender => (
                <button
                  key={gender}
                  onClick={() => onSelectGender(gender)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedGender === gender ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-purple-50'}`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        {accommodationOptions && accommodationOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Accommodation Type</h4>
            <div className="flex flex-wrap gap-2">
              {accommodationOptions.map(type => (
                <button
                  key={type}
                  onClick={() => onSelectAccommodation(type)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedAccommodation === type ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50'}`}
                >
                  {type.replace('-', ' ').replace('pg', 'PG').replace('flat', 'Flat/Apartment').replace('college hostel', 'College Hostel')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default FiltersSidebar; 