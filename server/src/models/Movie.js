import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true },
    synopsis: { type: String, required: true },
    posterUrl: String,
    backdropUrl: String,
    trailerUrl: String,
    genres: [{ type: String, index: true }],
    languages: [{ type: String, index: true }],
    cast: [{ name: String, character: String, photoUrl: String }],
    durationMinutes: Number,
    releaseDate: Date,
    rating: { type: Number, min: 0, max: 10, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
movieSchema.index({ title: "text", synopsis: "text" });
export const Movie = mongoose.model("Movie", movieSchema);
