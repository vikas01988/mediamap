import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Check,
  Film,
  MapPin,
  RefreshCw,
  Ticket,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api.js";

const metrics = [
  { key: "movies", label: "Movies", icon: Film },
  { key: "theatres", label: "Theatres", icon: MapPin },
  { key: "shows", label: "Shows", icon: BarChart3 },
  { key: "bookings", label: "Confirmed bookings", icon: Ticket },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [{ data: summary }, { data: bookingData }] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/bookings"),
      ]);
      setDashboard(summary);
      setBookings(bookingData.bookings || []);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("cinewave_token");
        toast.error("Admin access is required");
        navigate("/auth");
      } else
        toast.error(
          error.response?.data?.message || "Dashboard could not load",
        );
    } finally {
      setLoading(false);
    }
  }

  async function processRequest(bookingId, decision) {
    setProcessing(`${decision}:${bookingId}`);
    try {
      await api.patch(`/admin/bookings/${bookingId}/${decision}`);
      toast.success(
        decision === "approve"
          ? "Seats approved and confirmed"
          : "Request rejected and seats released",
      );
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || `${decision} failed`);
    } finally {
      setProcessing(null);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <section className="shell py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium tracking-[.16em] text-rose">
            OPERATIONS
          </p>
          <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">
            Admin dashboard
          </h1>
          <p className="mt-3 text-slate-400">
            Review user seat requests and approve or reject them.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon }) => (
          <div key={key} className="panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon size={18} className="text-rose" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">
              {loading ? "-" : (dashboard?.[key] ?? 0)}
            </p>
          </div>
        ))}
        <div className="panel p-5 sm:col-span-2 lg:col-span-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <BarChart3 size={18} className="text-lime" /> Confirmed revenue
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">
            ₹{loading ? "-" : (dashboard?.revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <div className="mt-12 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-rose">CUSTOMER ACTIVITY</p>
          <h2 className="mt-2 font-display text-3xl text-white">
            Seat requests
          </h2>
        </div>
        <span className="pill">
          <Users size={13} className="mr-1 inline" /> {bookings.length} latest
        </span>
      </div>
      <div className="panel mt-5 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-slate-400">Loading booking activity...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-slate-400">No booking requests yet.</div>
        ) : (
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Movie</th>
                <th className="px-5 py-4">Seats</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((booking) => (
                <tr key={booking._id} className="text-slate-300">
                  <td className="px-5 py-4 font-semibold text-white">
                    {booking.reference}
                  </td>
                  <td className="px-5 py-4">
                    {booking.user?.email || "Unknown user"}
                  </td>
                  <td className="px-5 py-4">
                    {booking.show?.movie?.title || "Movie unavailable"}
                  </td>
                  <td className="px-5 py-4">
                    {booking.seats?.map((seat) => seat.seatNumber).join(", ")}
                  </td>
                  <td className="px-5 py-4">₹{booking.amount}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${booking.status === "CONFIRMED" ? "bg-lime/15 text-lime" : booking.status === "CANCELLED" || booking.status === "FAILED" ? "bg-red-500/15 text-red-300" : "bg-amber/15 text-amber"}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {booking.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => processRequest(booking._id, "approve")}
                          disabled={processing}
                          className="flex items-center gap-1 rounded-lg bg-lime px-3 py-2 text-xs font-bold text-emerald-950 disabled:opacity-50"
                        >
                          <Check size={14} />
                          {processing === `approve:${booking._id}`
                            ? "Approving"
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => processRequest(booking._id, "reject")}
                          disabled={processing}
                          className="flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-200 disabled:opacity-50"
                        >
                          <X size={14} />
                          {processing === `reject:${booking._id}`
                            ? "Rejecting"
                            : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Link
        to="/movies"
        className="mt-8 inline-block text-sm text-rose hover:underline"
      >
        Return to customer catalogue
      </Link>
    </section>
  );
}
