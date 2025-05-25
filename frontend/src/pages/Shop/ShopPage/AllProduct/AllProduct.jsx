import React, { useState } from "react";
import CategoriesFilter from "../../../../components/ProductListComponent/CategoriesFilter/CategoriesFilter";
import ProductCard from "../../../../components/HomeComponents/ProductCard/ProductCard";
import "./AllProduct.css";
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

const AllProduct = ({ handleFilterChange, activeFilter }) => {
  // const [activeFilter, setActiveFilter] = useState({
  //   group: "CATEGORIES",
  //   value: "laptop",
  // });

  // Handler for filter changes
  // const handleFilterChange = (filterInfo) => {
  //   setActiveFilter(filterInfo);
  //   // You can add logic here to filter products based on the selected filter
  //   console.log(`Filter changed to ${filterInfo.group}: ${filterInfo.value}`);
  // };

  return (
    <div className="shop-all-product" id="all-products">
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

export default AllProduct;
