import React from "react";
import "./ProductCard.css";
import RatingStar from "../../RatingStar/RatingStar";
import EffectButton from "../../Button/Button";
const ProductCard = ({ product }) => {
  const { name, price, rating, image, originalPrice } = product;

  return (
    <div className="home-product-card">
      <div className="home-product-image">
        <img src={image || "/placeholder-image.jpg"} alt={name} />
      </div>

      <div className="home-product-details">
        <h3 className="home-product-name">{name}</h3>

        <div className="home-product-price">
          <span className="home-current-price">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="home-original-price">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="home-product-rating">
          <RatingStar rating={rating} />
        </div>

        <div className="home-product-actions">
          <EffectButton placeHolder="Buy now" />
          <button className="home-add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
