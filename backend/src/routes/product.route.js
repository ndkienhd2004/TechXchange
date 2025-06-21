const express = require("express");
const route = express.Router();
const ProductController = require("../app/controllers/productController.js");
const BrandController = require("../app/controllers/brandController.js");

route.get("/brands", BrandController.getAllBrands);
route.get("/brands/:id", BrandController.getBrandById);
route.post("/brands", BrandController.createBrand);
route.put("/brands/:id", BrandController.updateBrand);
route.delete("/brands/:id", BrandController.deleteBrand);

route.get("/", ProductController.getAllProducts);

route.get("/:id", ProductController.getProductById);

route.post("/", ProductController.createProduct);

route.put("/:id", ProductController.updateProduct);
route.delete("/:id", ProductController.deleteProduct);
// Protected routes example
route.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

module.exports = route;
