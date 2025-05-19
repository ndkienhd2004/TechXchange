import React, { useState } from "react";
import { Heart, ShoppingCart, Search, X } from "lucide-react";
import "./FavoriteProducts.css";

const FavoriteProducts = () => {
  const initialFavoriteItems = [
    {
      id: "1",
      name: "Áo Thun Cotton Basic",
      options: "Màu: Đỏ, Kích thước: M",
      price: 250000,
      inStock: true,
      image: "/api/placeholder/150/150",
    },
    {
      id: "2",
      name: "Quần Jeans Slim Fit",
      options: "Màu: Xanh, Kích thước: L",
      price: 300000,
      inStock: true,
      image: "/api/placeholder/150/150",
    },
    {
      id: "3",
      name: "Áo Sơ Mi Linen",
      options: "Màu: Vàng, Kích thước: S",
      price: 150000,
      inStock: false,
      image: "/api/placeholder/150/150",
    },
  ];

  const [favoriteItems, setFavoriteItems] = useState(initialFavoriteItems);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemoveItem = (itemId) => {
    setFavoriteItems(favoriteItems.filter((item) => item.id !== itemId));
  };

  const handleAddToCart = (item) => {
    // Xử lý thêm vào giỏ hàng (sẽ được triển khai sau)
    console.log(`Đã thêm ${item.name} vào giỏ hàng`);
    // Hiển thị thông báo thành công
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const clearFavorites = () => {
    setFavoriteItems([]);
  };

  const filteredItems = favoriteItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="favor-page">
      <div className="favor-header">
        <h1 className="favor-page-title">
          <Heart className="heart-icon" />
          Sản phẩm yêu thích
        </h1>
        {favoriteItems.length > 0 && (
          <span className="item-count">{favoriteItems.length} sản phẩm</span>
        )}
      </div>

      {favoriteItems.length > 0 && (
        <div className="favor-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="clear-all" onClick={clearFavorites}>
            Xóa tất cả
          </button>
        </div>
      )}

      {favoriteItems.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-favorites-icon">
            <Heart size={64} />
          </div>
          <h2>Danh sách yêu thích trống</h2>
          <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
          <button className="browse-products">Khám phá sản phẩm ngay</button>
        </div>
      ) : (
        <div className="favor-content">
          {filteredItems.length === 0 ? (
            <div className="no-results">
              <p>Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"</p>
            </div>
          ) : (
            <div className="favor-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="favor-item">
                  <div className="item-image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-image"
                    />
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-options">{item.options}</p>
                    <p className="item-price">{formatPrice(item.price)}</p>

                    <div className="item-actions">
                      {item.inStock ? (
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart size={16} />
                          Thêm vào giỏ
                        </button>
                      ) : (
                        <span className="out-of-stock">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;
