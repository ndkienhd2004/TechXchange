const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CatalogSpecRequest extends Model {}

  CatalogSpecRequest.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      requester_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      admin_id: {
        type: DataTypes.BIGINT,
      },
      catalog_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      spec_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      proposed_values: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      admin_note: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CatalogSpecRequest",
      tableName: "catalog_spec_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { name: "idx_csr_status", fields: ["status"] },
        { name: "idx_csr_catalog", fields: ["catalog_id"] },
        { name: "idx_csr_requester", fields: ["requester_id"] },
        {
          name: "uq_csr_pending_requester_catalog_key",
          unique: true,
          fields: ["requester_id", "catalog_id", "spec_key", "status"],
        },
      ],
    }
  );

  return CatalogSpecRequest;
};
