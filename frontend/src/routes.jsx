import { useRoutes } from "react-router-dom";
import Login from "./pages/Login";
import PATH from "./constants/path";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductListingPage from "./pages/ProductList/ProductList";
import ProductPage from "./pages/ProductPage/ProductPage";
import Cart from "./pages/Cart/Cart";
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
      element: <ProductListingPage />,
    },
    {
      path: PATH.productDetail,
      element: <ProductPage />,
    },
    {
      path: PATH.cart,
      element: <Cart />,
    },
  ]);
  return routes;
}
export default createRoutes;
