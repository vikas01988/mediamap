import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";
import { Booking } from "../models/Booking.js";
import { confirmBooking } from "./booking.service.js";

const client =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret,
      })
    : null;
export async function createOrder({ bookingId, userId }) {
  const booking = await Booking.findOne({
    _id: bookingId,
    user: userId,
    status: "PENDING",
    expiresAt: { $gt: new Date() },
  });
  if (!booking)
    throw Object.assign(new Error("Booking is not payable"), {
      statusCode: 409,
    });
  if (!client)
    return {
      order: {
        id: `demo_order_${booking._id}`,
        amount: booking.amount * 100,
        currency: "INR",
      },
      demo: true,
    };
  const order = await client.orders.create({
    amount: Math.round(booking.amount * 100),
    currency: "INR",
    receipt: booking.reference,
  });
  await Payment.create({
    booking: booking._id,
    user: userId,
    orderId: order.id,
    amount: booking.amount,
  });
  return { order, demo: false };
}
export async function verifyPayment({
  bookingId,
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret || "demo")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (env.razorpayKeySecret && expected !== razorpaySignature)
    throw Object.assign(new Error("Payment signature mismatch"), {
      statusCode: 400,
    });
  await Payment.findOneAndUpdate(
    { booking: bookingId, user: userId, orderId: razorpayOrderId },
    {
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      status: "CAPTURED",
    },
    { upsert: true },
  );
  return confirmBooking({ bookingId, userId, paymentId: razorpayPaymentId });
}
