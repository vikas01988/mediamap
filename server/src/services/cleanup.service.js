import { Show } from "../models/Show.js";
import { Booking } from "../models/Booking.js";

export async function releaseExpiredLocks(io) {
  const cutoff = new Date(Date.now() - 5 * 60_000);
  const shows = await Show.find(
    { seats: { $elemMatch: { status: "LOCKED", lockedAt: { $lt: cutoff } } } },
    { seats: 1 },
  );
  await Show.updateMany(
    { seats: { $elemMatch: { status: "LOCKED", lockedAt: { $lt: cutoff } } } },
    {
      $set: {
        "seats.$[seat].status": "AVAILABLE",
        "seats.$[seat].lockedBy": null,
        "seats.$[seat].lockedAt": null,
      },
    },
    {
      arrayFilters: [
        { "seat.status": "LOCKED", "seat.lockedAt": { $lt: cutoff } },
      ],
    },
  );
  await Booking.updateMany(
    { status: "PENDING", expiresAt: { $lt: new Date() } },
    { $set: { status: "FAILED" } },
  );
  for (const show of shows)
    io.to(`show:${show._id}`).emit("seat_released", { showId: show._id });
}
