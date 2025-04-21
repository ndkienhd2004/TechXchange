import { useRoutes } from "react-router-dom";
import Login from "./pages/Login";
import PATH from "./constants/path";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductListingPage from "./pages/ProductList/ProductList";
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
  ]);
  return routes;
}
export default createRoutes;
