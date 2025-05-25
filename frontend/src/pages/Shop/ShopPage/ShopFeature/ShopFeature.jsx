import { useEffect, useState } from "react";
import ProductCard from "../../../../components/HomeComponents/ProductCard/ProductCard";
import "./ShopFeature.css";
const productData = [
  {
    id: 1,
    name: "DELL Gaming G1",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 2,
    name: "DELL Gaming G2",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 3,
    name: "DELL Gaming G3",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 4,
    name: "DELL Gaming G4",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 5,
    name: "DELL Gaming G5",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 6,
    name: "DELL Gaming G6",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 7,
    name: "DELL Gaming G7",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 8,
    name: "DELL Gaming G8",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 9,
    name: "DELL Gaming G9",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
  {
    id: 10,
    name: "DELL Gaming G10",
    price: 170.0,
    rating: 4.0,
    image: "",
  },
];

const ShopFeature = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const itemsToShow = 5;

  useEffect(() => {
    const endIndex = currentIndex + itemsToShow;
    setVisibleProducts(productData.slice(currentIndex, endIndex));
  }, [currentIndex]);

  const nextSlide = () => {
    if (currentIndex + itemsToShow < productData.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="shop-feature" id="feature">
      <div className="featured-product-header">
        <h2>Featured Product</h2>
        <a href="#" className="view-all-link">
          View all products
        </a>
      </div>
      <div className="shop-products-container">
        <div className="carousel-container">
          <button
            className="carousel-button prev"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            &#8249;
          </button>
          <div className="shop-items-list">
            {visibleProducts.map((product) => (
              <div className="product-card-wrapper" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            className="carousel-button next"
            onClick={nextSlide}
            disabled={currentIndex + itemsToShow >= productData.length}
          >
            &#8250;
          </button>
        </div>
      </div>
      <div className="shop-introduction">
        <h3>Giới thiệu về Shop</h3>
        <p>
          Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi cung cấp các
          sản phẩm chất lượng cao với giá cả hợp lý. Hãy khám phá bộ sưu tập của
          chúng tôi và tìm kiếm những sản phẩm phù hợp nhất với bạn.
        </p>
        <p>
          Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
          Chúng tôi luôn sẵn lòng hỗ trợ bạn!
        </p>
      </div>
    </div>
  );
};

export default ShopFeature;
