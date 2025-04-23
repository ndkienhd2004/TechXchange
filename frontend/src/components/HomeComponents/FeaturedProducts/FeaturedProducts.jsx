import React from "react";
import "./FeaturedProducts.css";
import ProductCard from "../ProductCard/ProductCard";
const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Sony PlayStation 5 Pro 2TB",
      price: 1099,
      originalPrice: 1200,
      rating: 5.0,
      image: "/path/to/ps5.png", // Replace with your image path
    },
    {
      id: 2,
      name: "Nothing Phone (1)",
      price: 419,
      rating: 5.0,
      image: "/path/to/nothing-phone.png", // Replace with your image path
    },
    {
      id: 3,
      name: "iPad Air 6 M2 11 Inch 2024",
      price: 919,
      rating: 4.0,
      image: "/path/to/ipad.png", // Replace with your image path
    },
    {
      id: 4,
      name: "Apple HomePod mini",
      price: 135,
      rating: 5.0,
      image: "/path/to/homepod.png", // Replace with your image path
    },
  ];

  return (
    <div className="featured-products-container">
      <h2 className="featured-title">Featured Products</h2>

      <div className="featured-grid">
        {/* Premium Gadgets - Left column, spans entire height */}
        <div className="premium-gadgets-container">
          <div className="hot-deals-badge">HOT DEALS</div>
          <div className="gadgets-collection">Premium Gadgets Collection</div>
          <div className="premium-gadgets-text">
            <div className="premium-title">
              PREMIUM
              <br />
              GADGETS
            </div>
            <div className="premium-subtitle">Are Available at Anywhere</div>
          </div>
        </div>

        {/* Products - Right column layout */}
        <div className="products-feature-container">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
