import React from "react";
import { ShoppingCart } from "lucide-react";
import "./OrderSummary.css";
const OrderSummary = ({ total, onCheckout, discount }) => {
  const finalTotal = total - discount;

  return (
    <div className="order-summary">
      <h2 className="order-summary-title">Tổng tiền</h2>
      <div className="order-summary-details">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span className="font-medium">{total.toLocaleString()} VNĐ</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá:</span>
            <span className="font-medium">
              -{discount.toLocaleString()} VNĐ
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span className="font-medium">Miễn phí</span> {/* Hardcoded */}
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng:</span>
          <span>{finalTotal.toLocaleString()} VNĐ</span>
        </div>
      </div>
      <button className="checkout-button" onClick={onCheckout}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Mua hàng
      </button>
    </div>
  );
};

export default OrderSummary;
