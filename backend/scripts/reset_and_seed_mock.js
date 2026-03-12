/* eslint-disable no-console */
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");
const {
  sequelize,
  User,
  Store,
  ProductCategory,
  Brand,
  ProductCatalog,
  Product,
  ProductImage,
  ProductSerial,
  ProductInventory,
  UserAddress,
  UserProductEvent,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Message,
} = require("../src/models");

async function truncateAllTables() {
  const rows = await sequelize.query(
    `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> 'SequelizeMeta'
    `,
    { type: QueryTypes.SELECT },
  );

  const tableNames = rows.map((r) => `"public"."${r.tablename}"`);
  if (tableNames.length === 0) return;

  await sequelize.query(
    `TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE`,
  );
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  await truncateAllTables();

  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await User.create({
    username: "admin",
    email: "admin@techxchange.dev",
    phone: "0900000001",
    password_hash: passwordHash,
    role: "admin",
    gender: "other",
  });

  const shopAOwner = await User.create({
    username: "shop_a_owner",
    email: "shopa@techxchange.dev",
    phone: "0900000002",
    password_hash: passwordHash,
    role: "shop",
    gender: "male",
  });

  const shopBOwner = await User.create({
    username: "shop_b_owner",
    email: "shopb@techxchange.dev",
    phone: "0900000003",
    password_hash: passwordHash,
    role: "shop",
    gender: "female",
  });

  const userA = await User.create({
    username: "buyer_a",
    email: "buyera@techxchange.dev",
    phone: "0900000004",
    password_hash: passwordHash,
    role: "user",
    gender: "male",
  });

  const userB = await User.create({
    username: "buyer_b",
    email: "buyerb@techxchange.dev",
    phone: "0900000005",
    password_hash: passwordHash,
    role: "user",
    gender: "female",
  });

  const userC = await User.create({
    username: "buyer_c",
    email: "buyerc@techxchange.dev",
    phone: "0900000006",
    password_hash: passwordHash,
    role: "user",
    gender: "other",
  });

  const storeA = await Store.create({
    owner_id: shopAOwner.id,
    name: "TechX Store A",
    description: "Laptop, điện thoại, phụ kiện chính hãng",
    rating: 4.8,
    address_line: "12 Nguyễn Trãi",
    ward: "Phường 2",
    district: "Quận 5",
    city: "TP HCM",
    province: "Hồ Chí Minh",
    ghn_province_id: 202,
    ghn_district_id: 1451,
    ghn_ward_code: "21211",
    ghn_shop_id: 110001,
  });

  const storeB = await Store.create({
    owner_id: shopBOwner.id,
    name: "TechX Store B",
    description: "Thiết bị âm thanh và smart home",
    rating: 4.6,
    address_line: "88 Cầu Giấy",
    ward: "Dịch Vọng",
    district: "Quận Cầu Giấy",
    city: "Hà Nội",
    province: "Hà Nội",
    ghn_province_id: 201,
    ghn_district_id: 1442,
    ghn_ward_code: "21012",
    ghn_shop_id: 110002,
  });

  const catElectronics = await ProductCategory.create({
    name: "Electronics",
    slug: "electronics",
    level: 1,
    is_active: true,
  });
  const catLaptop = await ProductCategory.create({
    name: "Laptop",
    slug: "laptop",
    parent_id: catElectronics.id,
    level: 2,
    is_active: true,
  });
  const catPhone = await ProductCategory.create({
    name: "Phone",
    slug: "phone",
    parent_id: catElectronics.id,
    level: 2,
    is_active: true,
  });
  const catAudio = await ProductCategory.create({
    name: "Audio",
    slug: "audio",
    parent_id: catElectronics.id,
    level: 2,
    is_active: true,
  });
  const catAccessory = await ProductCategory.create({
    name: "Accessory",
    slug: "accessory",
    parent_id: catElectronics.id,
    level: 2,
    is_active: true,
  });

  const brandApple = await Brand.create({ name: "Apple" });
  const brandDell = await Brand.create({ name: "Dell" });
  const brandSony = await Brand.create({ name: "Sony" });
  const brandSamsung = await Brand.create({ name: "Samsung" });
  const brandUgreen = await Brand.create({ name: "UGREEN" });

  const catalogs = await ProductCatalog.bulkCreate(
    [
      {
        name: "MacBook Pro M5",
        brand_id: brandApple.id,
        category_id: catLaptop.id,
        description: "Laptop hiệu năng cao cho lập trình và sáng tạo",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200",
        msrp: 39990000,
        specs: { cpu: "M5", ram: "16GB", storage: "512GB SSD" },
      },
      {
        name: "Dell XPS 15",
        brand_id: brandDell.id,
        category_id: catLaptop.id,
        description: "Laptop mỏng nhẹ, màn hình đẹp",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=1200",
        msrp: 32990000,
        specs: { cpu: "Intel Core i7", ram: "16GB", storage: "1TB SSD" },
      },
      {
        name: "iPhone 15 Pro",
        brand_id: brandApple.id,
        category_id: catPhone.id,
        description: "Điện thoại cao cấp",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1695048133142-1a20484f9f0b?w=1200",
        msrp: 27990000,
        specs: { storage: "256GB", color: "Titanium" },
      },
      {
        name: "Samsung Galaxy S25",
        brand_id: brandSamsung.id,
        category_id: catPhone.id,
        description: "Flagship Android",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200",
        msrp: 24990000,
        specs: { storage: "256GB", color: "Black" },
      },
      {
        name: "Sony WH-1000XM5",
        brand_id: brandSony.id,
        category_id: catAudio.id,
        description: "Tai nghe chống ồn",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200",
        msrp: 8490000,
        specs: { type: "Over-ear", anc: "Yes" },
      },
      {
        name: "UGREEN USB-C Hub",
        brand_id: brandUgreen.id,
        category_id: catAccessory.id,
        description: "Hub đa cổng cho laptop",
        status: "active",
        default_image:
          "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=1200",
        msrp: 990000,
        specs: { ports: "7", hdmi: "4K" },
      },
    ],
    { returning: true },
  );

  const listingData = [
    { catalog: catalogs[0], store: storeA, seller: shopAOwner, price: 37990000, qty: 8 },
    { catalog: catalogs[1], store: storeA, seller: shopAOwner, price: 29990000, qty: 5 },
    { catalog: catalogs[2], store: storeA, seller: shopAOwner, price: 25990000, qty: 15 },
    { catalog: catalogs[3], store: storeB, seller: shopBOwner, price: 22990000, qty: 10 },
    { catalog: catalogs[4], store: storeB, seller: shopBOwner, price: 7990000, qty: 22 },
    { catalog: catalogs[5], store: storeB, seller: shopBOwner, price: 890000, qty: 40 },
  ];

  const products = [];
  for (const item of listingData) {
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.create({
      category_id: item.catalog.category_id,
      seller_id: item.seller.id,
      store_id: item.store.id,
      brand_id: item.catalog.brand_id,
      catalog_id: item.catalog.id,
      name: item.catalog.name,
      description: item.catalog.description,
      price: item.price,
      quantity: item.qty,
      rating: 4.5,
      buyturn: Math.floor(Math.random() * 300) + 50,
      status: "active",
    });
    // eslint-disable-next-line no-await-in-loop
    await ProductImage.create({
      product_id: product.id,
      url: item.catalog.default_image,
      sort_order: 0,
    });
    // eslint-disable-next-line no-await-in-loop
    const serial = await ProductSerial.create({
      product_id: product.id,
      serial_code: `SER-${product.id}-DEFAULT`,
      serial_specs: { condition: "new" },
    });
    // eslint-disable-next-line no-await-in-loop
    await ProductInventory.create({
      product_id: product.id,
      serial_id: serial.id,
      on_hand: item.qty,
      reserved: 0,
    });
    products.push(product);
  }

  await UserAddress.bulkCreate([
    {
      user_id: userA.id,
      full_name: "Buyer A",
      phone: "0900000004",
      address_line: "120 Văn Tự",
      ward: "Xã Văn Tự",
      district: "Huyện Thường Tín",
      city: "Hà Nội",
      province: "Hà Nội",
      ghn_province_id: 201,
      ghn_district_id: 3303,
      ghn_ward_code: "1B2729",
      is_default: true,
    },
    {
      user_id: userB.id,
      full_name: "Buyer B",
      phone: "0900000005",
      address_line: "10 Nguyễn Huệ",
      ward: "Bến Nghé",
      district: "Quận 1",
      city: "TP HCM",
      province: "Hồ Chí Minh",
      ghn_province_id: 202,
      ghn_district_id: 1444,
      ghn_ward_code: "20308",
      is_default: true,
    },
  ]);

  await UserProductEvent.bulkCreate([
    { user_id: userA.id, product_id: products[0].id, event_type: "view" },
    { user_id: userA.id, product_id: products[0].id, event_type: "add_to_cart" },
    { user_id: userA.id, product_id: products[2].id, event_type: "click" },
    { user_id: userB.id, product_id: products[4].id, event_type: "view" },
    { user_id: userB.id, product_id: products[4].id, event_type: "add_to_cart" },
    { user_id: userC.id, product_id: products[3].id, event_type: "view" },
  ]);

  const shippingAddress = {
    full_name: "Buyer A",
    phone: "0900000004",
    line1: "120 Văn Tự",
    ward: "Xã Văn Tự",
    district: "Huyện Thường Tín",
    city: "Hà Nội",
    province: "Hà Nội",
    ghn_province_id: 201,
    ghn_district_id: 3303,
    ghn_ward_code: "1B2729",
  };

  const order1 = await Order.create({
    customer_id: userA.id,
    store_id: storeA.id,
    total_price: 25990000,
    currency: "VND",
    payment_method: "cod",
    shipping_address: shippingAddress,
    status: "completed",
    note: "Giao giờ hành chính",
  });
  await OrderItem.create({
    order_id: order1.id,
    product_id: products[2].id,
    quantity: 1,
    price: products[2].price,
  });
  await Payment.create({
    order_id: order1.id,
    amount: order1.total_price,
    currency: "VND",
    payment_method: "cod",
    status: "completed",
  });
  await Shipment.create({
    order_id: order1.id,
    status: "delivered",
    shipping_provider: "ghn",
    shipping_service_id: 53320,
    shipping_service_type_id: 2,
    shipping_fee: 35000,
  });

  await Message.bulkCreate([
    {
      sender_id: userA.id,
      receiver_id: shopAOwner.id,
      message: "Shop ơi còn iPhone màu Titan không?",
      is_read: true,
    },
    {
      sender_id: shopAOwner.id,
      receiver_id: userA.id,
      message: "Còn bạn nhé, bản 256GB sẵn hàng.",
      is_read: false,
    },
  ]);

  console.log("✅ Reset & seed mock data thành công.");
  console.log("Tài khoản mẫu (mật khẩu: 123456):");
  console.log("- admin@techxchange.dev (admin)");
  console.log("- shopa@techxchange.dev (shop)");
  console.log("- shopb@techxchange.dev (shop)");
  console.log("- buyera@techxchange.dev (user)");
  console.log("- buyerb@techxchange.dev (user)");
  console.log("- buyerc@techxchange.dev (user)");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
