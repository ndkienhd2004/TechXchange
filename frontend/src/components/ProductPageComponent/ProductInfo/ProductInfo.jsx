import StarRating from "../../RatingStar/RatingStar";
import "./ProductInfo.css";
const ProductInfo = ({}) => {
  //   const { name, price, originalPrice, rating, image } = product;
  //   const formattedPrice = price.toLocaleString("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //   });
  //   const formattedOriginalPrice = originalPrice.toLocaleString("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //   });
  return (
    <div className="product-info">
      <h1 className="product-title">DELL Gaming G15</h1>
      <p className="product-description-short">
        A laptop is a portable computer and are battery powered.
      </p>
      <StarRating rating={4} />

      {/* Selection options */}
      <div className="product-options">
        <div className="option-row">
          <label>ABC</label>
          <div className="dropdown">
            ABC <span>▼</span>
          </div>
        </div>
        <div className="option-row">
          <label>ABC</label>
          <div className="dropdown">
            ABC <span>▼</span>
          </div>
        </div>
        <div className="option-row">
          <label>ABC</label>
          <div className="dropdown">
            ABC <span>▼</span>
          </div>
        </div>
        <div className="option-row">
          <label>ABC</label>
          <div className="dropdown">
            ABC <span>▼</span>
          </div>
        </div>
      </div>

      {/* Add to Cart */}
      <button className="add-to-cart-btn">Add to cart</button>
      <button className="buy-btn">Buy now</button>
    </div>
  );
};
export default ProductInfo;
