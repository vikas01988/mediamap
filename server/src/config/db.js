import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (env.useMemoryMongo) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri("cinewave"));
    console.log("MongoDB connected (development in-memory instance)");
    return memoryServer;
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
