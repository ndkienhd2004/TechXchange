import React, { useState } from "react";
import "./ProductPage.css";
import ProductInfo from "../../components/ProductPageComponent/ProductInfo/ProductInfo";
import Review from "../../components/ProductPageComponent/Review/Review";
const ProductPage = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const product = {
    id: 1,
    name: "DELL Gaming G15",
    price: 170.0,
    rating: 4.0,
    image: "",
    reviews: [
      {
        id: 1,
        author: "John Doe",
        date: "2023-08-15",
        rating: 5,
        content: "Great laptop for the price! Very fast and reliable.",
      },
    ],
  };
  const productImages = [
    "/images/dell-g15-main.jpg",
    "/images/dell-g15-1.jpg",
    "/images/dell-g15-2.jpg",
    "/images/dell-g15-3.jpg",
    "/images/dell-g15-4.jpg",
  ];

  const relatedProducts = [
    {
      id: 1,
      name: "abc xyz",
      price: 178.0,
      image: "/images/laptop-1.jpg",
    },
    {
      id: 2,
      name: "abc xyz",
      price: 170.0,
      image: "/images/laptop-2.jpg",
    },
  ];

  const handlePrevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImage((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="product-detail-page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Home</a> &gt; <a href="/categories">Categories</a> &gt;{" "}
        <a href="/laptop">Laptop</a> &gt; Dell Gaming G15
      </div>

      {/* Product Display */}
      <div className="product-detail-display">
        {/* Product Images */}
        <div className="product-detail-images">
          <div className="main-image-container">
            <img
              src={productImages[currentImage]}
              alt="Dell Gaming G15"
              className="main-image"
            />
          </div>
          <div className="thumbnail-carousel">
            <button
              className="product-carousel-btn prev"
              onClick={handlePrevImage}
            >
              &lt;
            </button>
            <div className="thumbnails">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    currentImage === index ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(index)}
                >
                  <img src={img} alt={`Dell Gaming G15 view ${index + 1}`} />
                </div>
              ))}
            </div>
            <button
              className="product-carousel-btn next"
              onClick={handleNextImage}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Product Info */}
        <ProductInfo />
      </div>

      {/* Vendor Section */}
      <div className="vendor-section">
        <div className="vendor-info">
          <div className="vendor-logo">
            <img src="/images/ugreen-logo.png" alt="Shop Logo" />
          </div>
          <div className="vendor-details">
            <h3>UGREEN Vietnam Shop</h3>
            <p>www.store.com</p>
            <div className="vendor-actions">
              <button className="chat-now-btn">Chat now</button>
              <button className="visit-shop-btn">Visit shop</button>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-description-container">
        <h2>Product Description</h2>
        <p>
          A laptop is a portable computer that can be easily carried around.
          It's a device designed for personal use and can perform various
          functions such as browsing the internet, creating documents, playing
          games, and more. Laptops are more compact than traditional desktop
          computers and are battery powered.
        </p>
      </div>

      {/* Ratings & Reviews */}
      <Review rating={product.rating} reviews={product.reviews} />

      {/* Popular Products */}
      <div className="popular-products">
        <h2>Popular products</h2>
        <div className="popular-products-grid">
          {relatedProducts.map((product) => (
            <div key={product.id} className="popular-products-card">
              <div className="popular-products-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="popular-products-name">{product.name}</div>
              <div className="popular-products-price">
                ${product.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
