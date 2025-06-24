import AuthRoute from "./auth.route.js";
// import UserRoute from "./user.route.js";
import ProductRoute from "./product.route.js";
// import StoreRoute from "./store.route.js";
import UserRoute from "./user.route.js";
import categoriesRoute from "./categories.route.js";
function route(app) {
  app.use("/api/auth", AuthRoute);
  app.use("/api/products", ProductRoute);
  app.use("/api/users", UserRoute);
  app.use("/api/categories", categoriesRoute);
  app.use("/api", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });
}

export default route;
