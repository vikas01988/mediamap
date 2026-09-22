import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  for (const name of required)
    if (!process.env[name]) throw new Error(`Missing ${name}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || null,
  useMemoryMongo:
    process.env.NODE_ENV !== "production" && !process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
};
