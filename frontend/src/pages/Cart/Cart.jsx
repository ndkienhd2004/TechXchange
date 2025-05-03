import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CartItem from "../../components/CartComponent/CartItem/CartItem"; // Import component CartItem
import PromotionBanner from "../../components/CartComponent/PromotionBanner/PromotionBanner"; // Import component PromotionBanner
import VoucherSection from "../../components/CartComponent/VoucherSection/VoucherSection"; // Import component VoucherSection
import OrderSummary from "../../components/CartComponent/OrderSummary/OrderSummary"; // Import component OrderSummary
import "./Cart.css";

// Dữ liệu sản phẩm mẫu (thay thế bằng dữ liệu thực tế của bạn)
const initialCartItems = [
  {
    id: "1",
    name: "Sản phẩm 1",
    options: "Màu: Đỏ, Kích thước: M",
    price: 250000,
    quantity: 2,
    image: "https://via.placeholder.com/150", // Thay thế bằng URL hình ảnh thực tế
  },
  {
    id: "2",
    name: "Sản phẩm 2",
    options: "Màu: Xanh, Kích thước: L",
    price: 300000,
    quantity: 1,
    image: "https://via.placeholder.com/150", // Thay thế bằng URL hình ảnh thực tế
  },
  {
    id: "3",
    name: "Sản phẩm 3",
    options: "Màu: Vàng, Kích thước: S",
    price: 150000,
    quantity: 3,
    image: "https://via.placeholder.com/150", // Thay thế bằng URL hình ảnh thật
  },
];

// Mã giảm giá mẫu
const VOUCHERS = [
  { code: "GIAM10", discount: 0.1, type: "percentage" }, // Giảm 10%
  { code: "GIAM50K", discount: 50000, type: "fixed" }, // Giảm 50.000 VNĐ
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const total = calculateTotal();

  // Tính giảm giá
  const calculateDiscount = () => {
    if (appliedVoucher) {
      if (appliedVoucher.type === "percentage") {
        return total * appliedVoucher.discount;
      } else if (appliedVoucher.type === "fixed") {
        return appliedVoucher.discount;
      }
    }
    return 0;
  };

  const discount = calculateDiscount();

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Hàm xử lý xóa sản phẩm
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // Hàm xử lý áp dụng mã giảm giá
  const handleApplyVoucher = (code) => {
    const voucher = VOUCHERS.find((v) => v.code === code);
    if (voucher) {
      setAppliedVoucher(voucher);
    } else {
      alert("Mã giảm giá không hợp lệ!"); // Replace with a better UI notification
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  // Hàm xử lý thanh toán (chuyển đến trang thanh toán)
  const handleCheckout = () => {
    //  Logic chuyển trang thanh toán (sử dụng React Router hoặc window.location.href)
    alert(`Chuyển đến trang thanh toán với tổng tiền: ${total - discount} VNĐ`);
  };

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">
        <ShoppingCart className="w-6 h-6" />
        Giỏ hàng của bạn
      </h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart-message">
          Giỏ hàng của bạn trống.
          {/* Thêm link để tiếp tục mua sắm */}
        </div>
      ) : (
        <div className="cart-content">
          {/* Danh sách sản phẩm */}
          <div className="product-list">
            <PromotionBanner />
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Tổng tiền và thanh toán */}
          <div className="order-summary-section">
            <VoucherSection
              onApplyVoucher={handleApplyVoucher}
              appliedVoucher={appliedVoucher}
              onRemoveVoucher={handleRemoveVoucher}
            />
            <OrderSummary
              total={total}
              onCheckout={handleCheckout}
              discount={discount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
