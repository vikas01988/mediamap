import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    amenities: [String],
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],
  },
  { timestamps: true },
);
export const Theatre = mongoose.model("Theatre", theatreSchema);

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    rows: { type: Number, required: true, min: 1, max: 30 },
    columns: { type: Number, required: true, min: 1, max: 30 },
    layout: [
      {
        seatNumber: String,
        row: String,
        number: Number,
        type: { type: String, default: "regular" },
      },
    ],
  },
  { timestamps: true },
);
export const Screen = mongoose.model("Screen", screenSchema);
