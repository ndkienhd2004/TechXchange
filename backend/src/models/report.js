const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {}

  Report.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      reporter_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      reported_user_id: {
        type: DataTypes.BIGINT,
      },
      reported_product_id: {
        type: DataTypes.BIGINT,
      },
      reported_store_id: {
        type: DataTypes.BIGINT,
      },
      reason: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "resolved", "rejected"),
        defaultValue: "pending",
      },
      reviewed_at: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Report",
      tableName: "reports",
      timestamps: false,
      indexes: [
        { name: "idx_reports_status_created", fields: ["status", "created_at"] },
        {
          name: "idx_reports_reporter_created",
          fields: ["reporter_id", "created_at"],
        },
      ],
    }
  );

  return Report;
};
