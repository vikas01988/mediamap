import { z } from "zod";
import { Booking } from "../models/Booking.js";
import { Show } from "../models/Show.js";
import {
  confirmBooking,
  createPendingBooking,
  lockSeats,
  releaseSeats,
} from "../services/booking.service.js";
const seatInput = z.object({
  showId: z.string().min(1),
  seatNumbers: z.array(z.string().min(1)).min(1).max(12),
});
export async function lock(req, res, next) {
  try {
    const input = seatInput.parse(req.body);
    const { show, seats } = await lockSeats({ ...input, userId: req.user._id });
    const booking = await createPendingBooking({
      show,
      seats,
      userId: req.user._id,
    });
    req.app.get("io").to(`show:${show._id}`).emit("seat_locked", {
      showId: show._id,
      seatNumbers: input.seatNumbers,
    });
    res.status(201).json({ booking, show });
  } catch (error) {
    next(error);
  }
}
export async function pay(req, res, next) {
  try {
    const booking = await confirmBooking({
      bookingId: req.params.id,
      userId: req.user._id,
      paymentId: req.body.paymentId || `demo_${Date.now()}`,
    });
    req.app
      .get("io")
      .to(`show:${booking.show}`)
      .emit("seat_booked", {
        showId: booking.show,
        seatNumbers: booking.seats.map((seat) => seat.seatNumber),
      });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}
export async function fail(req, res, next) {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "PENDING",
    });
    if (!booking)
      return res.status(404).json({ message: "Pending booking not found" });
    await releaseSeats({
      showId: booking.show,
      seatNumbers: booking.seats.map((seat) => seat.seatNumber),
      userId: req.user._id,
    });
    booking.status = "FAILED";
    await booking.save();
    req.app
      .get("io")
      .to(`show:${booking.show}`)
      .emit("seat_released", {
        showId: booking.show,
        seatNumbers: booking.seats.map((seat) => seat.seatNumber),
      });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}
export async function history(req, res, next) {
  try {
    res.json({
      bookings: await Booking.find({ user: req.user._id })
        .populate({ path: "show", populate: ["movie", "theatre"] })
        .sort({ createdAt: -1 }),
    });
  } catch (error) {
    next(error);
  }
}
