import React from "react";
import { FiX } from "react-icons/fi";

const ActiveFiltersChips = ({
  selectedCategories = [],
  selectedConditions = [],
  selectedDurations = [],
  selectedRequestTypes = [],
  selectedPriceRanges = [],
  priceRange = null,
  selectedGender,
  selectedAccommodation,
  budgetRange,
  onRemoveCategory = () => {},
  onRemoveCondition = () => {},
  onRemoveDuration = () => {},
  onRemoveRequestType = () => {},
  onRemovePriceRange = () => {},
  onReset = () => {},
  onRemoveGender = () => {},
  onRemoveAccommodation = () => {},
  onRemoveBudget = () => {}
}) => {
  const chips = [];
  selectedCategories.forEach(cat => chips.push({ label: cat.replace('-', ' '), onRemove: () => onRemoveCategory(cat) }));
  selectedConditions.forEach(cond => chips.push({ label: cond.replace('-', ' '), onRemove: () => onRemoveCondition(cond) }));
  selectedDurations.forEach(dur => chips.push({ label: dur.replace('-', ' '), onRemove: () => onRemoveDuration(dur) }));
  selectedRequestTypes.forEach(type => chips.push({ label: type.replace('-', ' '), onRemove: () => onRemoveRequestType(type) }));
  selectedPriceRanges.forEach(range => chips.push({ label: range.replace('-', ' '), onRemove: () => onRemovePriceRange(range) }));
  if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000)) {
    chips.push({ label: `₹${priceRange[0]} - ₹${priceRange[1]}`, onRemove: () => onRemovePriceRange(priceRange) });
  }
  if (selectedGender) {
    chips.push({ label: `Gender: ${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}`, onRemove: onRemoveGender });
  }
  if (selectedAccommodation) {
    chips.push({ label: `Accommodation: ${selectedAccommodation.replace('-', ' ').replace('pg', 'PG').replace('flat', 'Flat/Apartment').replace('college hostel', 'College Hostel')}`, onRemove: onRemoveAccommodation });
  }
  if (budgetRange && (budgetRange[0] > 0 || budgetRange[1] < 20000)) {
    chips.push({ label: `Budget: ₹${budgetRange[0]} - ₹${budgetRange[1]}`, onRemove: onRemoveBudget });
  }
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <span key={i} className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
          {chip.label}
          <button onClick={chip.onRemove} className="ml-2 text-purple-500 hover:text-purple-900">
            <FiX className="w-4 h-4" />
          </button>
        </span>
      ))}
      <button onClick={onReset} className="ml-2 px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold hover:bg-gray-300 transition">
        Clear All
      </button>
    </div>
  );
};

export default ActiveFiltersChips; 