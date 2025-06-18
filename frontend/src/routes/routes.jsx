import { useRoutes } from "react-router-dom";
import Login from "../pages/Login";
import PATH from "../constants/path";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ProductList from "../pages/ProductList/ProductList";
import ProductDetail from "../pages/ProductPage/ProductPage";
import Cart from "../pages/Cart/Cart";
import FavoriteProducts from "../pages/User/FavoriteProducts/FavoriteProducts";
import ProtectedRoute from "./ProtectedRoutes";
import NotAuthorized from "../pages/NotAuthorized/NotAuthorized";
import ShopPage from "../pages/Shop/ShopPage/ShopPage";
import ShopManagement from "../pages/Shop/ShopManagement/ShopManagement";
import Analystic from "../pages/Shop/ShopManagement/Analystic/Analystic";
function createRoutes() {
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: PATH.login,
      element: <Login />,
    },
    {
      path: PATH.register,
      element: <Register />,
    },
    {
      path: PATH.productList,
      element: <ProductList />,
    },
    {
      path: PATH.productDetail,
      // path: `${PATH.productDetail}/:id`,
      element: <ProductDetail />,
    },
    {
      path: PATH.cart,
      element: <Cart />,
    },
    {
      path: PATH.favoriteProducts,
      element: (
        <ProtectedRoute requiredRole="user">
          <FavoriteProducts />
        </ProtectedRoute>
      ),
    },
    {
      path: PATH.shopPage,
      element: <ShopPage />,
    },
    {
      path: PATH.shopManagement,
      // <ProtectedRoute requiredRole="shop">
      element: <ShopManagement />,
      // </ProtectedRoute>
      children: [
        {
          path: "dashboard",
          element: <div>Shop Dashboard</div>,
        },
        {
          path: "orders",
          element: <div>Shop Orders</div>,
        },
        {
          path: "products",
          element: <div>Shop Products</div>,
        },
        {
          path: "profile",
          element: <div>Shop Profile</div>,
        },
        {
          path: "analytics",
          element: <Analystic />,
        },
        {
          path: "message",
          element: <div>Shop Message</div>,
        },
      ],
    },
    { path: "/unauthorized", element: <NotAuthorized /> },
  ]);
  return routes;
}
export default createRoutes;
