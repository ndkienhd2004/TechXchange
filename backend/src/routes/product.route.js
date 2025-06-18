import * as ProductController from "../app/controllers/productController.js";
const router = require("express").Router();

export default function productRoute(app) {
  router.get("/", ProductController.getAllProducts);

  router.get("/:id", ProductController.getProductById);

  router.post("/", ProductController.createProduct);

  router.put("/:id", ProductController.updateProduct);
  router.delete("/:id", ProductController.deleteProduct);

  app.use(router);
}
