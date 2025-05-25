import ShopManagementNavbar from "./ShopManagementNavbar/ShopManagementNavbar";
import { Outlet } from "react-router-dom";
const ShopManagement = () => {
  return (
    <div className="shop-management">
      <ShopManagementNavbar />
      <Outlet />
    </div>
  );
};
export default ShopManagement;
