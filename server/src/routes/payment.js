import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { order, verify } from "../controllers/payment.controller.js";
const router = Router();
router.use(protect);
router.post("/:bookingId/order", order);
router.post("/:bookingId/verify", verify);
export default router;
