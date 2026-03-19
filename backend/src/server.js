require("dotenv").config();

const http = require("http");
const app = require("./app");
const sequelize = require("../config/db");
const { User, RefreshToken } = require("./models");
const { createSocketServer } = require("./socket");

const port = Number(process.env.PORT || 3000);

/**
 * Sync database models and create tables if they don't exist
 */
async function syncDatabase() {
  try {
    console.log("🔄 Syncing database models...");

    // Ensure optional profile columns exist before app queries them.
    await sequelize.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT"
    );
    await sequelize.query(
      "ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo TEXT"
    );
    await sequelize.query(
      "ALTER TABLE stores ADD COLUMN IF NOT EXISTS banner TEXT"
    );
    await sequelize.query(
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT"
    );
    await sequelize.query(
      "ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ghn_order_code VARCHAR(64)"
    );
    await sequelize.query(
      "ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ghn_status VARCHAR(64)"
    );
    await sequelize.query(
      "ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ghn_last_sync_at TIMESTAMP"
    );
    await sequelize.query(
      "ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ghn_payload TEXT"
    );
    await sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_shipments_ghn_order_code ON shipments(ghn_order_code)"
    );

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: false });

    console.log("✅ Database sync completed");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
}

/**
 * Verify database integrity
 */
async function verifyDatabaseIntegrity() {
  try {
    console.log("🔐 Verifying database integrity...");

    // Check users count
    const userCount = await sequelize.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const users = userCount[0][0].count;
    console.log(`   - Users: ${users}`);

    // Check refresh_tokens count
    const tokenCount = await sequelize.query(
      "SELECT COUNT(*) as count FROM refresh_tokens"
    );
    const tokens = tokenCount[0][0].count;
    console.log(`   - Refresh Tokens: ${tokens}`);

    console.log("✅ Database integrity verified");
  } catch (error) {
    console.error("❌ Database integrity check failed:", error);
    throw error;
  }
}

/**
 * Main server startup function
 */
async function start() {
  try {
    console.log("🚀 Starting TechXchange Backend Server...\n");

    // Step 1: Authenticate database
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // Step 2: Sync database models
    await syncDatabase();
    console.log();

    // Step 4: Verify database integrity
    await verifyDatabaseIntegrity();
    console.log();

    // Step 5: Start Express server
    console.log("🌐 Starting Express server...");
    const server = http.createServer(app);
    createSocketServer(server);

    server.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/docs`);
      console.log(`❤️ Health Check: http://localhost:${port}/health\n`);
      console.log(`💬 Socket.IO enabled on ws://localhost:${port}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start server
start();
