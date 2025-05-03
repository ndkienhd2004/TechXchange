import StarRating from "../../RatingStar/RatingStar";
import "./ProductCard.css";
import EffectButton from "../../Button/Button"; // Capitalize the import

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <div className="product-price">$ {product.price.toFixed(2)}</div>
      <StarRating rating={product.rating} />
      <div className="product-actions">
        <button className="buy-now-btn">Buy now</button>
        <EffectButton placeHolder="Add to cart" />
      </div>
    </div>
  );
};

export default ProductCard;
