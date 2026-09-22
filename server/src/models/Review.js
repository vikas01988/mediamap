import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
export const Review = mongoose.model("Review", reviewSchema);
