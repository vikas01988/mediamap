import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: String,
    title: String,
    message: String,
    readAt: Date,
  },
  { timestamps: true },
);
export const Notification = mongoose.model("Notification", notificationSchema);
