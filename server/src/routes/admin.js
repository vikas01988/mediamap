import { Router } from "express";
import { adminOnly, protect } from "../middlewares/auth.js";
import {
  createMovie,
  createScreen,
  createShow,
  createTheatre,
  dashboard,
  listBookings,
  approveBookingRequest,
  rejectBookingRequest,
} from "../controllers/admin.controller.js";
const router = Router();
router.use(protect, adminOnly);
router.get("/dashboard", dashboard);
router.get("/bookings", listBookings);
router.patch("/bookings/:id/approve", approveBookingRequest);
router.patch("/bookings/:id/reject", rejectBookingRequest);
router.post("/movies", createMovie);
router.post("/theatres", createTheatre);
router.post("/screens", createScreen);
router.post("/shows", createShow);
export default router;
