import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seats: [{ seatNumber: String, price: Number }],
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentOrderId: String,
    paymentId: String,
    expiresAt: Date,
  },
  { timestamps: true },
);
bookingSchema.index({ user: 1, createdAt: -1 });
export const Booking = mongoose.model("Booking", bookingSchema);
