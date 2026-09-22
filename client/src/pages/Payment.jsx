import { useEffect, useMemo, useState } from "react";
import { CreditCard, LockKeyhole, Smartphone, Ticket } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { setBooking } from "../redux/bookingSlice.js";

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { booking } = useSelector((state) => state.booking);
  const [bookingFromApi, setBookingFromApi] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const selectedBooking = booking?._id === bookingId ? booking : bookingFromApi;
  const total = selectedBooking?.amount || 0;

  useEffect(() => {
    if (booking?._id === bookingId) {
      setSessionLoading(false);
      return;
    }
    api
      .get("/bookings/me")
      .then(({ data }) => {
        const recovered = data.bookings?.find((item) => item._id === bookingId);
        if (recovered) {
          setBookingFromApi(recovered);
          dispatch(setBooking(recovered));
        }
      })
      .catch((error) => {
        if (error.response?.status === 401) navigate("/auth");
      })
      .finally(() => setSessionLoading(false));
  }, [booking, bookingId, dispatch, navigate]);

  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const timerText = useMemo(
    () =>
      `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`,
    [timeLeft],
  );

  async function payNow() {
    setLoading(true);
    try {
      const { data: orderData } = await api.post(
        `/payments/${bookingId}/order`,
      );
      if (orderData.demo) {
        const { data } = await api.post(`/bookings/${bookingId}/pay`, {
          paymentId: `demo_${Date.now()}`,
        });
        dispatch(setBooking(data.booking));
      } else {
        throw new Error(
          "Razorpay checkout is not configured for this local environment",
        );
      }
      toast.success("Payment successful. Your seats are confirmed.");
      navigate("/bookings");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment could not be completed",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sessionLoading)
    return (
      <section className="shell py-24 text-center text-slate-400">
        Recovering your payment session...
      </section>
    );
  if (!selectedBooking)
    return (
      <section className="shell py-24 text-center">
        <Ticket className="mx-auto text-rose" size={30} />
        <h1 className="mt-4 font-display text-3xl text-white">
          Payment session unavailable
        </h1>
        <p className="mt-2 text-slate-400">
          This booking may have expired. Return to the movie catalogue and
          select your seats again.
        </p>
        <button
          onClick={() => navigate("/movies")}
          className="mt-6 rounded-full bg-rose px-5 py-3 font-semibold text-white"
        >
          Browse movies
        </button>
      </section>
    );

  return (
    <section className="shell py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium tracking-[.16em] text-rose">
              SECURE CHECKOUT
            </p>
            <h1 className="mt-2 font-display text-4xl text-white">
              Complete your booking
            </h1>
            <p className="mt-2 text-slate-400">
              Your seats are held for{" "}
              <span className="font-semibold text-amber">{timerText}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <LockKeyhole size={16} className="text-lime" /> Protected payment
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="panel p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">
              Choose a payment method
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["card", CreditCard, "Card"],
                ["upi", Smartphone, "UPI"],
                ["wallet", Ticket, "Wallet"],
              ].map(([value, Icon, label]) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === value ? "border-rose bg-rose/10 text-white" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-5">
              <p className="text-sm text-slate-400">
                {paymentMethod === "card"
                  ? "Card details"
                  : paymentMethod === "upi"
                    ? "UPI ID"
                    : "Wallet details"}
              </p>
              <input
                placeholder={
                  paymentMethod === "card"
                    ? "4242 4242 4242 4242"
                    : paymentMethod === "upi"
                      ? "name@bank"
                      : "Wallet mobile number"
                }
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-rose"
              />
              <div className="mt-3 flex gap-3">
                <input
                  placeholder="Name on payment"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
                <input
                  placeholder="PIN / CVV"
                  className="w-32 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
            <button
              onClick={payNow}
              disabled={loading || timeLeft === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-rose px-5 py-4 font-semibold text-white hover:bg-rose/90 disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Processing payment..." : `Pay ₹${total}`}
            </button>
            <p className="mt-4 text-center text-xs text-slate-500">
              Demo mode confirms locally. Configure Razorpay keys for live
              checkout.
            </p>
          </div>
          <aside className="panel h-fit p-6">
            <p className="text-xs tracking-[.16em] text-rose">ORDER SUMMARY</p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Seats held
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Booking reference</span>
                <span className="text-right text-slate-200">
                  {selectedBooking.reference}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Seats</span>
                <span className="text-right font-semibold text-white">
                  {selectedBooking.seats
                    .map((seat) => seat.seatNumber)
                    .join(", ")}
                </span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-base">
                  <span className="text-slate-400">Total</span>
                  <span className="font-semibold text-white">₹{total}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
