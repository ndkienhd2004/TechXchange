import "./home.css";
import BrandLogo from "../../components/BrandLogos/BrandLogos";
import ProductCard from "../../components/HomeComponents/ProductCard/ProductCard";
import { useEffect, useState } from "react";
import FeaturedProducts from "../../components/HomeComponents/FeaturedProducts/FeaturedProducts";
const Home = () => {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const itemsToShow = 5;
  useEffect(() => {
    // Update visible products when currentIndex changes
    const endIndex = currentIndex + itemsToShow;
    const visible = productData.slice(currentIndex, endIndex);
    setVisibleProducts(visible);
  }, [currentIndex, itemsToShow]);

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
    <div className="home">
      <div className="home-content">
        <div className="home-leftOutline">
          <h1 className="home-title">
            Upgrade <span>Your Play</span>,<br />
            Rule The Battlefield
          </h1>
        </div>
        <div className="home-rightOutline"></div>
      </div>
      <BrandLogo />
      <div className="home-advertisement"></div>
      {/* New Arrival Section */}
      <div className="home-items">
        <h1>New Arrival</h1>
        <div className="carousel-container">
          <button
            className="carousel-button prev"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            &#8249;
          </button>
          <div className="home-items-list">
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
        {/* Featured Products Section */}
        <FeaturedProducts />
      </div>
    </div>
  );
};

export default Home;
