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
      image: "/path/to/ps5.png",
    },
    {
      id: 2,
      name: "Nothing Phone (1)",
      price: 419,
      rating: 5.0,
      image: "/path/to/nothing-phone.png",
    },
    {
      id: 3,
      name: "iPad Air 6 M2 11 Inch 2024",
      price: 919,
      rating: 4.0,
      image: "/path/to/ipad.png",
    },
    {
      id: 4,
      name: "Apple HomePod mini",
      price: 135,
      rating: 5.0,
      image: "/path/to/homepod.png",
    },
  ];

  return (
    <div className="featured-products-container">
      <h1 className="featured-title">Featured Products</h1>

      <div className="featured-grid">
        {/* Premium Gadgets - Left column */}
        <div className="premium-gadgets-container">
          <div className="premium-gadgets-content">
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
        </div>

        {/* Products - Right column layout */}
        <div className="products-grid-container">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
