const productService = require("../services/ProductServices.js");
class ProductController {
  constructor() {
    this.productService = productService;
  }
  getAllProducts = async (req, res) => {
    try {
      const products = await this.productService.getAllProducts();
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      res.status(200).json(products);
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  };

  getProductById = async (req, res) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error in getProductById:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  };
  async createProduct(req, res) {
    try {
      const newProduct = await this.productService.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
  async updateProduct(req, res) {
    try {
      const updatedProduct = await this.productService.updateProduct(
        req.params.id,
        req.body
      );
      const { name, description, price, imageUrl } = productData;
      if (price !== undefined && (isNaN(price) || price <= 0)) {
        throw new Error("Price must be a positive number");
      }
      // Thêm bước kiểm tra này, giống như bạn đã làm ở hàm delete
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
  deleteProduct = async (req, res) => {
    try {
      const result = await this.productService.deleteProduct(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  };
}

module.exports = new ProductController();
