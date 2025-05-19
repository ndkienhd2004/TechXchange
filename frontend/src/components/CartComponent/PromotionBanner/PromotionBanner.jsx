// PromotionBanner.js
import React from "react";
import "./PromotionBanner.css"; // Import CSS riêng cho PromotionBanner

const PromotionBanner = () => {
  return (
    <div className="promotion-banner" role="alert">
      <p className="promotion-header">Khuyến mãi!</p>
      <p>Miễn phí vận chuyển cho đơn hàng trên 500.000 VNĐ</p>
    </div>
  );
};

export default PromotionBanner;
