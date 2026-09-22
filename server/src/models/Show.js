import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "LOCKED", "BOOKED"],
      default: "AVAILABLE",
    },
    price: { type: Number, required: true, min: 0 },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lockedAt: { type: Date, default: null },
  },
  { _id: false },
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
      index: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    startsAt: { type: Date, required: true, index: true },
    endsAt: Date,
    seats: { type: [seatSchema], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
showSchema.index({ movie: 1, startsAt: 1 });
export const Show = mongoose.model("Show", showSchema);
