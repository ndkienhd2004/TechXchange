const BrandService = require("../services/BrandService.js");

class BrandController {
  async getAllBrands(req, res) {
    try {
      const brands = await BrandService.getAllBrands();
      if (brands.length === 0) {
        return res.status(404).json({ message: "No brands found" });
      }
      res.status(200).json(brands);
    } catch (error) {
      console.error("Error in getAllBrands:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
  async getBrandById(req, res) {
    try {
      const brand = await BrandService.getBrandById(req.params.id);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.status(200).json(brand);
    } catch (error) {
      console.error("Error in getBrandById:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
  async createBrand(req, res) {
    try {
      const newBrand = await BrandService.createBrand(req.body);
      res.status(201).json(newBrand);
    } catch (error) {
      console.error("Error in createBrand:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  }
  updateBrand = async (req, res) => {
    try {
      const updatedBrand = await BrandService.updateBrand(
        req.params.id,
        req.body
      );
      if (!updatedBrand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.status(200).json(updatedBrand);
    } catch (error) {
      console.error("Error in updateBrand:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  };
  deleteBrand = async (req, res) => {
    try {
      const result = await BrandService.deleteBrand(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.status(200).json(result); // Trả về message từ service
    } catch (error) {
      console.error("Error in deleteBrand:", error);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  };
}
module.exports = new BrandController();
