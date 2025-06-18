import { Sequelize } from "sequelize";
import db from "../models/user";

export default function getAllProducts(req, res) {
  const products = [
    { id: 1, name: "Product 1", price: 100 },
    { id: 2, name: "Product 2", price: 200 },
    { id: 3, name: "Product 3", price: 300 },
  ];

  res.status(200).json(products);
}

export function getProductById(req, res) {
  const productId = parseInt(req.params.id, 10);
  const products = [
    { id: 1, name: "Product 1", price: 100 },
    { id: 2, name: "Product 2", price: 200 },
    { id: 3, name: "Product 3", price: 300 },
  ];

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
}

export async function createProduct(req, res) {
  try {
    // await db.Product.create(req.body);
    res
      .status(201)
      .json({ message: "Product created successfully", data: req.body });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export function updateProduct(req, res) {
  const productId = parseInt(req.params.id, 10);
  const updatedProduct = req.body;
  // Logic to update the product in the database would go here
  updatedProduct.id = productId; // Ensure the ID remains the same
  res.status(200).json(updatedProduct);
}

export function deleteProduct(req, res) {
  const productId = parseInt(req.params.id, 10);
  // Logic to delete the product from the database would go here
  res.status(204).send(); // No content to return after deletion
}
