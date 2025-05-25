import { Link, useNavigate } from "react-router-dom";
import "./ShopManagementNavbar.css";
const ShopManagementNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="app-icon">
          <Link to="/">
            <img src="./assets/QAirlineNewLogo.png" alt="" />
          </Link>
        </div>
      </div>
      <ul className="sidebar-list">
        <li
          className="sidebar-list-item active"
          onClick={() => navigate("/shop-management/dashboard")}
        >
          <a>
            <span>Dashboard</span>
          </a>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => navigate("/shop-management/orders")}
        >
          <a>
            <span>Orders</span>
          </a>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => navigate("/shop-management/products")}
        >
          <a>
            <span>Products</span>
          </a>
        </li>

        <li
          className="sidebar-list-item"
          onClick={() => navigate("/shop-management/analytics")}
        >
          <a>
            <span>Analytics</span>
          </a>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => navigate("/shop-management/profile")}
        >
          <a>
            <span>Profile</span>
          </a>
        </li>
      </ul>
    </div>
  );
};
export default ShopManagementNavbar;
