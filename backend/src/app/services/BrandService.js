const { Brand } = require("../../models");

class BrandService {
  constructor() {
    this.brandRepository = Brand;
  }

  async getAllBrands() {
    return await this.brandRepository.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
  }

  async getBrandById(id) {
    return await this.brandRepository.findOne({
      where: { id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
  }

  async createBrand(brandData) {
    const { name, image } = brandData;

    if (!name || !image) {
      throw new Error("Name and image are required fields");
    }
    return await this.brandRepository.create({
      name,
      image,
    });
  }

  async updateBrand(id, brandData) {
    const brand = await this.brandRepository.findByPk(id);
    if (!brand) {
      return null;
    }

    await brand.update(brandData, {
      fields: ["name", "image"],
    });
    return brand;
  }

  async deleteBrand(id) {
    const brand = await this.brandRepository.findByPk(id);
    if (!brand) {
      return null;
    }
    return await this.brandRepository.delete(id);
  }
}
module.exports = new BrandService();
