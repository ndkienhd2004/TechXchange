import React, { useState } from "react";
import "./CategoriesFilter.css";

const FilterSection = ({
  label,
  options,
  isOpen,
  onToggle,
  onSelect,
  activeFilter,
}) => {
  return (
    <div className="filter-section">
      <button className="filter-header" onClick={onToggle}>
        {label} <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="filter-content">
          {options.map((option) => (
            <div key={option.value} className="filter-item">
              <input
                type="radio"
                id={`${label}-${option.value}`}
                name="global-filter" // Same name for all filters for single selection
                checked={
                  activeFilter.group === label &&
                  activeFilter.value === option.value
                }
                onChange={() => onSelect(label, option.value)}
              />
              <label htmlFor={`${label}-${option.value}`}>{option.label}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesFilter = ({ activeFilter, onFilterChange }) => {
  const filterGroups = [
    {
      label: "NEW IN",
      options: [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
      ],
    },
    {
      label: "SALE",
      options: [
        { value: "discount", label: "Discount %" },
        { value: "clearance", label: "Clearance" },
      ],
    },
    {
      label: "CATEGORIES",
      options: [
        { value: "pc", label: "PC" },
        { value: "laptop", label: "Laptop" },
        { value: "ram", label: "Ram" },
        { value: "cpu", label: "CPU" },
        { value: "screen", label: "Screen" },
        { value: "camera", label: "Camera" },
      ],
    },
    {
      label: "BEST SELLER",
      options: [
        { value: "top-rated", label: "Top Rated" },
        { value: "most-sold", label: "Most Sold" },
      ],
    },
  ];

  // Track which sections are open
  const [openSections, setOpenSections] = useState({
    "NEW IN": false,
    SALE: false,
    CATEGORIES: true, // Start with Categories section open
    "BEST SELLER": false,
  });

  // Handler for toggling sections open/closed
  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Handler for filter selection - pass the selected filter up to the parent
  const handleFilterSelect = (group, value) => {
    onFilterChange({ group, value });
  };

  return (
    <div className="filters-sidebar">
      {filterGroups.map((group) => (
        <FilterSection
          key={group.label}
          label={group.label}
          options={group.options}
          isOpen={openSections[group.label]}
          onToggle={() => toggleSection(group.label)}
          onSelect={handleFilterSelect}
          activeFilter={activeFilter}
        />
      ))}
    </div>
  );
};

export default CategoriesFilter;
