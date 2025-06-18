import ShopManagementNavbar from "./ShopManagementNavbar/ShopManagementNavbar";
import { Outlet } from "react-router-dom";
import "./ShopManagement.css";
const ShopManagement = () => {
  return (
    <div className="shop-management">
      <div className="shop-management-sidebar">
        <ShopManagementNavbar />
      </div>
      <div className="shop-management-content">
        <Outlet />
      </div>
    </div>
  );
};
export default ShopManagement;
