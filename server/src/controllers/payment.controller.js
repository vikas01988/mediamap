import { z } from "zod";
import { createOrder, verifyPayment } from "../services/payment.service.js";
const payment = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
export async function order(req, res, next) {
  try {
    res
      .status(201)
      .json(
        await createOrder({
          bookingId: req.params.bookingId,
          userId: req.user._id,
        }),
      );
  } catch (error) {
    next(error);
  }
}
export async function verify(req, res, next) {
  try {
    const input = payment.parse(req.body);
    res.json({
      booking: await verifyPayment({
        bookingId: req.params.bookingId,
        userId: req.user._id,
        ...input,
      }),
    });
  } catch (error) {
    next(error);
  }
}
