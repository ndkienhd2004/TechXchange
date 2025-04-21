import React, { useState } from "react";
import "./ProductList.css";
import CategoriesFilter from "../../components/ProductListComponent/CategoriesFilter/CategoriesFilter";
import BrandLogos from "../../components/BrandLogos/BrandLogos";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductListComponent/ProductCard/ProductCard";
const productData = [
  {
    id: 1,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 2,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 3,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 4,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 5,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 6,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
];

const ProductListingPage = () => {
  const [activeFilter, setActiveFilter] = useState({
    group: "CATEGORIES",
    value: "laptop",
  });

  // Handler for filter changes
  const handleFilterChange = (filterInfo) => {
    setActiveFilter(filterInfo);
    // You can add logic here to filter products based on the selected filter
    console.log(`Filter changed to ${filterInfo.group}: ${filterInfo.value}`);
  };

  return (
    <div className="product-listing-page">
      {/* Brand logos section */}
      <Navbar />
      <BrandLogos />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Categories</span> / <span>Laptop</span>
        <button className="filter-button">
          Filter <span className="filter-icon">⌗</span>
        </button>
      </div>

      {/* Main content with filters and products */}
      <div className="content-container">
        {/* Left sidebar with filters - using the separate component */}
        <CategoriesFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        {/* Products grid */}
        <div className="products-grid">
          {productData.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
