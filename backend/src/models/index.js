const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = require("./user")(sequelize, DataTypes);
const Message = require("./message")(sequelize, DataTypes);
const Store = require("./store")(sequelize, DataTypes);
const ProductCategory = require("./productCategory")(sequelize, DataTypes);
const Brand = require("./brand")(sequelize, DataTypes);
const BrandRequest = require("./brandRequest")(sequelize, DataTypes);
const ProductRequest = require("./productRequest")(sequelize, DataTypes);
const ProductCatalog = require("./productCatalog")(sequelize, DataTypes);
const Product = require("./product")(sequelize, DataTypes);
const AdminReview = require("./adminReview")(sequelize, DataTypes);
const Order = require("./order")(sequelize, DataTypes);
const OrderItem = require("./orderItem")(sequelize, DataTypes);
const News = require("./news")(sequelize, DataTypes);
const NewsDetail = require("./newsDetail")(sequelize, DataTypes);
const Review = require("./review")(sequelize, DataTypes);
const Report = require("./report")(sequelize, DataTypes);
const Payment = require("./payment")(sequelize, DataTypes);
const Shipment = require("./shipment")(sequelize, DataTypes);
const CartItem = require("./cartItem")(sequelize, DataTypes);
const UserPassedItem = require("./userPassedItem")(sequelize, DataTypes);
const Banner = require("./banner")(sequelize, DataTypes);
const BannerDetail = require("./bannerDetail")(sequelize, DataTypes);
const UserProductEvent = require("./userProductEvent")(sequelize, DataTypes);
const ProductImage = require("./productImage")(sequelize, DataTypes);
const ProductAttribute = require("./productAttribute")(sequelize, DataTypes);
const RefreshToken = require("./refreshToken")(sequelize, DataTypes);
const StoreRequest = require("./storeRequest")(sequelize, DataTypes);

User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiver_id", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

User.hasMany(Store, { foreignKey: "owner_id", as: "stores" });
Store.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

User.hasMany(StoreRequest, { foreignKey: "user_id", as: "storeRequests" });
StoreRequest.belongsTo(User, { foreignKey: "user_id", as: "user" });
StoreRequest.belongsTo(User, { foreignKey: "admin_id", as: "admin" });
StoreRequest.belongsTo(Store, { foreignKey: "store_id", as: "store" });

ProductCategory.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(ProductCategory, {
  foreignKey: "category_id",
  as: "category",
});

Brand.hasMany(Product, { foreignKey: "brand_id", as: "products" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

Brand.hasMany(ProductCatalog, { foreignKey: "brand_id", as: "catalogs" });
ProductCatalog.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

ProductCategory.hasMany(ProductCatalog, {
  foreignKey: "category_id",
  as: "catalogs",
});
ProductCatalog.belongsTo(ProductCategory, {
  foreignKey: "category_id",
  as: "category",
});

User.hasMany(BrandRequest, {
  foreignKey: "requester_id",
  as: "brandRequests",
});
BrandRequest.belongsTo(User, { foreignKey: "requester_id", as: "requester" });
BrandRequest.belongsTo(User, { foreignKey: "admin_id", as: "admin" });
BrandRequest.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

User.hasMany(ProductRequest, {
  foreignKey: "requester_id",
  as: "productRequests",
});
ProductRequest.belongsTo(User, { foreignKey: "requester_id", as: "requester" });
ProductRequest.belongsTo(User, { foreignKey: "admin_id", as: "admin" });
ProductRequest.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
ProductRequest.belongsTo(ProductCategory, {
  foreignKey: "category_id",
  as: "category",
});
ProductRequest.belongsTo(ProductCatalog, {
  foreignKey: "catalog_id",
  as: "catalog",
});

User.hasMany(Product, { foreignKey: "seller_id", as: "products" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

Store.hasMany(Product, { foreignKey: "store_id", as: "products" });
Product.belongsTo(Store, { foreignKey: "store_id", as: "store" });

ProductCatalog.hasMany(Product, { foreignKey: "catalog_id", as: "listings" });
Product.belongsTo(ProductCatalog, { foreignKey: "catalog_id", as: "catalog" });

User.hasMany(AdminReview, { foreignKey: "admin_id", as: "adminReviews" });
AdminReview.belongsTo(User, { foreignKey: "admin_id", as: "admin" });
Product.hasMany(AdminReview, { foreignKey: "product_id", as: "adminReviews" });
AdminReview.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Order, { foreignKey: "customer_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "customer_id", as: "customer" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

News.hasMany(NewsDetail, { foreignKey: "news_id", as: "details" });
NewsDetail.belongsTo(News, { foreignKey: "news_id", as: "news" });
Product.hasMany(NewsDetail, { foreignKey: "product_id", as: "newsDetails" });
NewsDetail.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Review, { foreignKey: "reviewer_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Store.hasMany(Review, { foreignKey: "store_id", as: "reviews" });
Review.belongsTo(Store, { foreignKey: "store_id", as: "store" });

User.hasMany(Report, { foreignKey: "reporter_id", as: "reports" });
Report.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });
User.hasMany(Report, {
  foreignKey: "reported_user_id",
  as: "reportedUserReports",
});
Report.belongsTo(User, { foreignKey: "reported_user_id", as: "reportedUser" });
Product.hasMany(Report, { foreignKey: "reported_product_id", as: "reports" });
Report.belongsTo(Product, {
  foreignKey: "reported_product_id",
  as: "reportedProduct",
});
Store.hasMany(Report, { foreignKey: "reported_store_id", as: "reports" });
Report.belongsTo(Store, {
  foreignKey: "reported_store_id",
  as: "reportedStore",
});

Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Order.hasMany(Shipment, { foreignKey: "order_id", as: "shipments" });
Shipment.belongsTo(Order, { foreignKey: "order_id", as: "order" });

User.hasMany(CartItem, { foreignKey: "user_id", as: "cartItems" });
CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(UserPassedItem, {
  foreignKey: "seller_id",
  as: "soldPassedItems",
});
User.hasMany(UserPassedItem, {
  foreignKey: "buyer_id",
  as: "boughtPassedItems",
});
UserPassedItem.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
UserPassedItem.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Product.hasMany(UserPassedItem, {
  foreignKey: "product_id",
  as: "passedItems",
});
UserPassedItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Banner.hasMany(BannerDetail, { foreignKey: "banner_id", as: "details" });
BannerDetail.belongsTo(Banner, { foreignKey: "banner_id", as: "banner" });
Product.hasMany(BannerDetail, {
  foreignKey: "product_id",
  as: "bannerDetails",
});
BannerDetail.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(UserProductEvent, { foreignKey: "user_id", as: "productEvents" });
UserProductEvent.belongsTo(User, { foreignKey: "user_id", as: "user" });
Product.hasMany(UserProductEvent, { foreignKey: "product_id", as: "events" });
UserProductEvent.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.hasMany(ProductAttribute, {
  foreignKey: "product_id",
  as: "attributes",
});
ProductAttribute.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  User,
  Message,
  Store,
  ProductCategory,
  Brand,
  BrandRequest,
  ProductRequest,
  ProductCatalog,
  Product,
  AdminReview,
  Order,
  OrderItem,
  News,
  NewsDetail,
  Review,
  Report,
  Payment,
  Shipment,
  CartItem,
  UserPassedItem,
  Banner,
  BannerDetail,
  UserProductEvent,
  ProductImage,
  ProductAttribute,
  RefreshToken,
  StoreRequest,
};
