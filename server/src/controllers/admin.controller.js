import { Movie } from "../models/Movie.js";
import { Theatre, Screen } from "../models/Theatre.js";
import { Show } from "../models/Show.js";
import { Booking } from "../models/Booking.js";
import { approveBooking, rejectBooking } from "../services/booking.service.js";
export async function dashboard(req, res, next) {
  try {
    const [movies, theatres, shows, bookings, revenue] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments({ status: "CONFIRMED" }),
      Booking.aggregate([
        { $match: { status: "CONFIRMED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    res.json({
      movies,
      theatres,
      shows,
      bookings,
      revenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
}
export async function createMovie(req, res, next) {
  try {
    res.status(201).json({ movie: await Movie.create(req.body) });
  } catch (error) {
    next(error);
  }
}
export async function createTheatre(req, res, next) {
  try {
    res.status(201).json({ theatre: await Theatre.create(req.body) });
  } catch (error) {
    next(error);
  }
}
export async function createScreen(req, res, next) {
  try {
    const screen = await Screen.create(req.body);
    await Theatre.findByIdAndUpdate(screen.theatre, {
      $push: { screens: screen._id },
    });
    res.status(201).json({ screen });
  } catch (error) {
    next(error);
  }
}
export async function createShow(req, res, next) {
  try {
    res.status(201).json({ show: await Show.create(req.body) });
  } catch (error) {
    next(error);
  }
}
export async function listBookings(req, res, next) {
  try {
    res.json({
      bookings: await Booking.find()
        .populate("user show")
        .sort({ createdAt: -1 })
        .limit(100),
    });
  } catch (error) {
    next(error);
  }
}
export async function approveBookingRequest(req, res, next) {
  try {
    const booking = await approveBooking({
      bookingId: req.params.id,
      adminId: req.user._id,
    });
    req.app
      .get("io")
      .to(`show:${booking.show}`)
      .emit("booking_confirmed", {
        showId: booking.show,
        bookingId: booking._id,
        seatNumbers: booking.seats.map((seat) => seat.seatNumber),
      });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}
export async function rejectBookingRequest(req, res, next) {
  try {
    const booking = await rejectBooking({
      bookingId: req.params.id,
      adminId: req.user._id,
    });
    req.app
      .get("io")
      .to(`show:${booking.show}`)
      .emit("booking_rejected", {
        showId: booking.show,
        bookingId: booking._id,
        seatNumbers: booking.seats.map((seat) => seat.seatNumber),
      });
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}
