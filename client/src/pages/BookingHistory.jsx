import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/bookings/me")
      .then(({ data }) => setBookings(data.bookings || []))
      .catch((error) => {
        if (error.response?.status === 401) navigate("/auth");
        else toast.error("Bookings could not load");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <section className="shell py-12">
      <p className="text-sm font-medium text-rose">YOUR CINEMA JOURNEY</p>
      <h1 className="mt-2 font-display text-4xl text-white">My bookings</h1>
      <p className="mt-3 text-slate-400">
        Every request, approval, and confirmed seat in one place.
      </p>
      {loading ? (
        <div className="panel mt-8 p-8 text-slate-400">
          Loading your tickets...
        </div>
      ) : bookings.length === 0 ? (
        <div className="panel mt-8 p-8">
          <p className="text-slate-400">You have no booking requests yet.</p>
          <Link
            to="/movies"
            className="mt-5 inline-block rounded-full bg-rose px-5 py-3 font-semibold text-white"
          >
            Explore movies
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {bookings.map((booking) => {
            const show = booking.show;
            const movie = show?.movie;
            return (
              <article key={booking._id} className="panel overflow-hidden">
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs tracking-[.18em] text-rose">
                      {booking.status === "CONFIRMED"
                        ? "CONFIRMED TICKET"
                        : "BOOKING REQUEST"}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {movie?.title || "Movie"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Booking {booking.reference}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "CONFIRMED" ? "bg-lime/15 text-lime" : booking.status === "PENDING" ? "bg-amber/15 text-amber" : "bg-red-500/15 text-red-300"}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="grid gap-5 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Theatre</p>
                    <p className="mt-1 flex items-center gap-2 text-slate-200">
                      <MapPin size={15} className="text-rose" />
                      {show?.theatre?.name || "-"}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {show?.theatre?.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Showtime</p>
                    <p className="mt-1 flex items-center gap-2 text-slate-200">
                      <CalendarDays size={15} className="text-rose" />
                      {show?.startsAt
                        ? new Date(show.startsAt).toLocaleDateString()
                        : "-"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-slate-400">
                      <Clock3 size={14} />
                      {show?.startsAt
                        ? new Date(show.startsAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Seats</p>
                    <p className="mt-1 flex items-center gap-2 font-semibold text-white">
                      <Ticket size={15} className="text-rose" />
                      {booking.seats?.map((seat) => seat.seatNumber).join(", ")}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {show?.screen?.name || "Assigned screen"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total paid</p>
                    <p className="mt-1 text-2xl font-semibold text-white">
                      ₹{booking.amount}
                    </p>
                    <p className="mt-1 text-slate-400">
                      {booking.status === "PENDING"
                        ? "Awaiting admin approval"
                        : "Keep this reference for entry"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
