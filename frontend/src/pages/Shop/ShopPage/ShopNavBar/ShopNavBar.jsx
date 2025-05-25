import React, { useState } from "react";
import "./ShopNavBar.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
const ShopNavBar = () => {
  const tabs = [
    { id: "feature", name: "Feature", icon: null, isSpecial: true },
    {
      id: "all-products",
      name: "All Products",
      icon: null,
      isSpecial: false,
    },
    {
      id: "events",
      name: "Events abc",
      icon: "🎉",
      isSpecial: false,
    },
    {
      id: "hardware",
      name: "Hardware",
      icon: "🖥️",
      isSpecial: false,
    },

    {
      id: "keyboard-mouse",
      name: "Keyboard & Mouse",
      icon: null,
      isSpecial: false,
    },
    {
      id: "more",
      name: "Thêm",
      icon: null,
      isSpecial: true,
      hasDropdown: true,
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="shop-nav-container">
      <nav className="shop-nav-bar">
        <div className="shop-nav-items-container">
          {tabs.map((tab) => (
            <Link
              to={tab.id}
              key={tab.id}
              smooth={true}
              duration={500}
              className={`shop-nav-item shop-${tab.id}`}
            >
              {tab.icon && (
                <span className="shop-category-icon">{tab.icon}</span>
              )}

              <span className="shop-nav-text">{tab.name}</span>

              {tab.hasDropdown && <span className="shop-dropdown-icon">▼</span>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ShopNavBar;
