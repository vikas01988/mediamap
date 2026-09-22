import crypto from "node:crypto";
import { Show } from "../models/Show.js";
import { Booking } from "../models/Booking.js";

const LOCK_MINUTES = 5;
const reference = () =>
  `CW-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

export async function lockSeats({ showId, seatNumbers, userId }) {
  const uniqueSeats = [...new Set(seatNumbers)];
  if (!uniqueSeats.length)
    throw Object.assign(new Error("Select at least one seat"), {
      statusCode: 400,
    });
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - LOCK_MINUTES * 60_000);
  const show = await Show.findOneAndUpdate(
    {
      _id: showId,
      isActive: true,
      seats: {
        $all: uniqueSeats.map((seatNumber) => ({
          $elemMatch: {
            seatNumber,
            $or: [
              { status: "AVAILABLE" },
              { status: "LOCKED", lockedAt: { $lt: expiredBefore } },
            ],
          },
        })),
      },
    },
    {
      $set: {
        "seats.$[seat].status": "LOCKED",
        "seats.$[seat].lockedBy": userId,
        "seats.$[seat].lockedAt": now,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "seat.seatNumber": { $in: uniqueSeats } },
            {
              $or: [
                { "seat.status": "AVAILABLE" },
                {
                  "seat.status": "LOCKED",
                  "seat.lockedAt": { $lt: expiredBefore },
                },
              ],
            },
          ],
        },
      ],
      new: true,
    },
  ).populate("movie theatre screen");
  if (!show)
    throw Object.assign(new Error("One or more seats are unavailable"), {
      statusCode: 409,
    });
  const seats = show.seats.filter((seat) =>
    uniqueSeats.includes(seat.seatNumber),
  );
  return { show, seats };
}

export async function createPendingBooking({ show, seats, userId }) {
  const amount = seats.reduce((sum, seat) => sum + seat.price, 0);
  return Booking.create({
    reference: reference(),
    user: userId,
    show: show._id,
    seats: seats.map(({ seatNumber, price }) => ({ seatNumber, price })),
    amount,
    expiresAt: new Date(Date.now() + LOCK_MINUTES * 60_000),
  });
}

export async function releaseSeats({ showId, seatNumbers, userId }) {
  return Show.updateOne(
    { _id: showId },
    {
      $set: {
        "seats.$[seat].status": "AVAILABLE",
        "seats.$[seat].lockedBy": null,
        "seats.$[seat].lockedAt": null,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "seat.seatNumber": { $in: seatNumbers } },
            { "seat.lockedBy": userId },
            { "seat.status": "LOCKED" },
          ],
        },
      ],
    },
  );
}

export async function confirmBooking({ bookingId, userId, paymentId }) {
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      user: userId,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    },
    { $set: { status: "CONFIRMED", paymentId } },
    { new: true },
  );
  if (!booking)
    throw Object.assign(new Error("Booking is no longer payable"), {
      statusCode: 409,
    });
  await Show.updateOne(
    { _id: booking.show },
    {
      $set: {
        "seats.$[seat].status": "BOOKED",
        "seats.$[seat].lockedBy": null,
        "seats.$[seat].lockedAt": null,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            {
              "seat.seatNumber": {
                $in: booking.seats.map((seat) => seat.seatNumber),
              },
            },
            { "seat.lockedBy": userId },
            { "seat.status": "LOCKED" },
          ],
        },
      ],
    },
  );
  return booking;
}

export async function approveBooking({ bookingId, adminId }) {
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    },
    { $set: { status: "CONFIRMED", paymentId: `admin_${adminId}` } },
    { new: true },
  );
  if (!booking) {
    throw Object.assign(new Error("Booking is no longer pending"), {
      statusCode: 409,
    });
  }

  const seatNumbers = booking.seats.map((seat) => seat.seatNumber);
  const showUpdate = await Show.updateOne(
    {
      _id: booking.show,
      seats: {
        $all: seatNumbers.map((seatNumber) => ({
          $elemMatch: {
            seatNumber,
            status: "LOCKED",
            lockedBy: booking.user,
          },
        })),
      },
    },
    {
      $set: {
        "seats.$[seat].status": "BOOKED",
        "seats.$[seat].lockedBy": null,
        "seats.$[seat].lockedAt": null,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "seat.seatNumber": { $in: seatNumbers } },
            { "seat.status": "LOCKED" },
            { "seat.lockedBy": booking.user },
          ],
        },
      ],
    },
  );
  if (!showUpdate.matchedCount) {
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { status: "FAILED" } },
    );
    throw Object.assign(new Error("The requested seats are no longer locked"), {
      statusCode: 409,
    });
  }
  return booking;
}

export async function rejectBooking({ bookingId, adminId }) {
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    },
    { $set: { status: "CANCELLED", paymentId: `rejected_${adminId}` } },
    { new: true },
  );
  if (!booking) {
    throw Object.assign(new Error("Booking is no longer pending"), {
      statusCode: 409,
    });
  }
  const seatNumbers = booking.seats.map((seat) => seat.seatNumber);
  await Show.updateOne(
    { _id: booking.show },
    {
      $set: {
        "seats.$[seat].status": "AVAILABLE",
        "seats.$[seat].lockedBy": null,
        "seats.$[seat].lockedAt": null,
      },
    },
    {
      arrayFilters: [
        {
          $and: [
            { "seat.seatNumber": { $in: seatNumbers } },
            { "seat.status": "LOCKED" },
            { "seat.lockedBy": booking.user },
          ],
        },
      ],
    },
  );
  return booking;
}
