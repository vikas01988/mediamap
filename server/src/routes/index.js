import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginUser, me, registerUser } from "../controllers/auth.controller.js";
import {
  listMovies,
  movieDetails,
  showDetails,
} from "../controllers/catalog.controller.js";
import { fail, history, lock, pay } from "../controllers/booking.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
const authLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 50,
  standardHeaders: true,
});
router.post("/auth/register", authLimit, registerUser);
router.post("/auth/login", authLimit, loginUser);
router.get("/auth/me", protect, me);
router.get("/movies", listMovies);
router.get("/movies/:slug", movieDetails);
router.get("/shows/:id", showDetails);
router.post("/bookings/lock", protect, lock);
router.post("/bookings/:id/pay", protect, pay);
router.post("/bookings/:id/fail", protect, fail);
router.get("/bookings/me", protect, history);
export default router;
