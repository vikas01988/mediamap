import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, default: "razorpay" },
    orderId: { type: String, required: true, unique: true },
    paymentId: String,
    signature: String,
    amount: Number,
    status: {
      type: String,
      enum: ["CREATED", "CAPTURED", "FAILED"],
      default: "CREATED",
    },
  },
  { timestamps: true },
);
export const Payment = mongoose.model("Payment", paymentSchema);
