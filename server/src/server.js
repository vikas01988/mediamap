import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { configureSocket } from "./socket/index.js";
import { releaseExpiredLocks } from "./services/cleanup.service.js";
import { seedAdditionalMovies, seedDevelopmentData } from "./config/seed.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});
app.set("io", io);
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "cinewave-api" }),
);
app.use("/api", routes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(errorHandler);
configureSocket(io);

const memoryServer = await connectDatabase();
if (env.nodeEnv !== "production") {
  await seedDevelopmentData();
  await seedAdditionalMovies();
}
setInterval(
  () =>
    releaseExpiredLocks(io).catch((error) =>
      console.error("Lock cleanup failed", error),
    ),
  60_000,
);
server.listen(env.port, () => console.log(`API listening on ${env.port}`));
