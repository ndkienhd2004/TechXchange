const { Product } = require("../../models");

class productService {
  constructor() {}

  async getAllProducts() {
    return Product.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] }, // Loại bỏ createdAt và updatedAt khỏi danh sách
    });
  }

  async getProductById(productId) {
    return Product.findOne({
      where: { id: productId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
  }

  async createProduct(productData) {
    const { name, description, price, imageUrl } = productData;

    // Kiểm tra xem tất cả các trường bắt buộc đã được cung cấp
    if (!name || !description || !price || !imageUrl) {
      throw new Error("All fields are required");
    }

    // Tạo sản phẩm mới
    const newProduct = await Product.create({
      name,
      description,
      price,
      imageUrl,
    });

    return newProduct;
  }

  async updateProduct(productId, productData) {
    const product = await Product.findByPk(productId);
    if (!product) {
      return null;
    }

    await product.update(productData);

    return product;
  }

  async deleteProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      return null;
    }
    await product.destroy();
    return true;
  }
}

module.exports = new productService();
