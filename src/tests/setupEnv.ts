import dotenv from "dotenv";

// Load environment variables from .env.test file if it exists
dotenv.config({ path: ".env.test" });

// Set default test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.MONGODB_URI_TEST =
  process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/emart_test";
process.env.PORT = process.env.PORT || "5001";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Export test configuration
export const testConfig = {
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI_TEST,
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
};
