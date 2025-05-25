import { useEffect, useState } from "react";
import "./Banner.css";
import banner1 from "../../../../assets/Images/banner1.png";
import banner2 from "../../../../assets/Images/banner2.png";
import banner3 from "../../../../assets/Images/banner3.png";
const bannerData = [
  { id: 1, image: banner1, alt: "Banner 1" },
  { id: 2, image: banner2, alt: "Banner 2" },
  { id: 3, image: banner3, alt: "Banner 3" },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerData.length);
    }, 3000); // auto chuyển banner mỗi 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-carousel" id="events">
      <img
        src={bannerData[currentIndex].image}
        alt={bannerData[currentIndex].alt}
        className="banner-image"
      />
      <div className="banner-dots">
        {bannerData.map((banner, index) => (
          <span
            key={banner.id}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};
export default BannerCarousel;
