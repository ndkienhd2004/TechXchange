"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      // định nghĩa các mối quan hệ ở đây
    }
  }
  Report.init(
    {
      //... các thuộc tính của bạn
      reason: DataTypes.TEXT,
      status: DataTypes.ENUM("pending", "resolved", "rejected"),
      target_type: DataTypes.ENUM("user", "product", "store"),
      //...
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "reports",
      underscored: true,
      // === THÊM LOGIC KIỂM TRA Ở ĐÂY ===
      validate: {
        onlyOneTarget() {
          const targets = [
            this.reported_user_id,
            this.reported_product_id,
            this.reported_store_id,
          ];
          const nonNullTargets = targets.filter(
            (target) => target !== null
          ).length;

          if (nonNullTargets !== 1) {
            throw new Error(
              "A report must have exactly one target (user, product, or store)."
            );
          }
        },
      },
    }
  );
  return Report;
};
