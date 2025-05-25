import { useEffect, useState } from "react";
import shopLogo from "../../../assets/Images/ugreen-logo.png";
import ShopNavBar from "./ShopNavBar/ShopNavBar";
import "./ShopPage.css";
import ShopFeature from "./ShopFeature/ShopFeature";
import AllProduct from "./AllProduct/AllProduct";
import BannerCarousel from "./Banner/Banner";

const ShopPage = () => {
  const [activeFilter, setActiveFilter] = useState({
    group: "CATEGORIES",
    value: "laptop",
  });

  // Handler for filter changes
  const handleFilterChange = (filterInfo) => {
    setActiveFilter(filterInfo);
    // You can add logic here to filter products based on the selected filter
    console.log(`Filter changed to ${filterInfo.group}: ${filterInfo.value}`);
  };
  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-logo">
          <img src={shopLogo} alt="Shop Logo" />
        </div>

        <div className="shop-info-container">
          <div className="shop-name-section">
            <h3>Ugreen Official Shop</h3>
            <span className="online-status">Online 6 phút trước</span>
          </div>

          <div className="shop-actions">
            <button className="follow-shop-btn">Follow</button>
            <button className="visit-shop-btn">Chat now</button>
          </div>
        </div>

        <div className="shop-stats">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Sản Phẩm:</span>
              <span className="stat-value highlight">833</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Người Theo Dõi:</span>
              <span className="stat-value highlight">590,5k</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Đang Theo:</span>
              <span className="stat-value">1,3k</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đánh Giá:</span>
              <span className="stat-value">4.9 (150,4k Đánh Giá)</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Tỉ Lệ Phản Hồi Chat:</span>
              <span className="stat-value highlight">
                100% (Trong Vài Phút)
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tham Gia:</span>
              <span className="stat-value">5 Năm Trước</span>
            </div>
          </div>
        </div>
      </div>
      <div className="shop-nav-container">
        <ShopNavBar />
      </div>
      <ShopFeature />
      <div className="shop-banners">
        <BannerCarousel />
      </div>
      <AllProduct
        handleFilterChange={handleFilterChange}
        activeFilter={activeFilter}
      />
    </div>
  );
};

export default ShopPage;
