import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import {
  patchSeats,
  setBooking,
  setShow,
  toggleSeat,
} from "../redux/bookingSlice.js";
export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { show, selectedSeats } = useSelector((state) => state.booking);
  useEffect(() => {
    let socket;
    api
      .get(`/shows/${showId}`)
      .then(({ data }) => {
        dispatch(setShow(data.show));
        socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
        socket.emit("join_show", showId);
        for (const event of ["seat_locked", "seat_released", "seat_booked"])
          socket.on(event, (payload) => {
            if (payload.showId === showId)
              api
                .get(`/shows/${showId}`)
                .then(({ data: refreshed }) =>
                  dispatch(setShow(refreshed.show)),
                );
          });
      })
      .catch(() => toast.error("Show could not be loaded"));
    return () => socket?.disconnect();
  }, [dispatch, showId]);
  const selectedTotal = useMemo(
    () =>
      show?.seats
        .filter((seat) => selectedSeats.includes(seat.seatNumber))
        .reduce((sum, seat) => sum + seat.price, 0) || 0,
    [show, selectedSeats],
  );
  async function reserve() {
    if (!localStorage.getItem("cinewave_token")) {
      toast.error("Sign in before selecting seats");
      navigate("/auth");
      return;
    }
    try {
      const { data } = await api.post("/bookings/lock", {
        showId,
        seatNumbers: selectedSeats,
      });
      dispatch(setBooking(data.booking));
      navigate(`/payment/${data.booking._id}`);
      toast.success("Seats held for five minutes");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Your session expired. Sign in again.");
        navigate("/auth");
        return;
      }
      toast.error(
        error.response?.data?.message || "Those seats are no longer available",
      );
    }
  }
  if (!show)
    return <div className="shell py-24 text-slate-400">Loading seats...</div>;
  return (
    <section className="shell py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-rose">SELECT YOUR SEATS</p>
        <h1 className="mt-2 font-display text-4xl text-white">
          {show.movie?.title}
        </h1>
        <p className="mt-2 text-slate-400">
          {show.theatre?.name} · {show.screen?.name}
        </p>
        <div className="panel mt-10 p-5 sm:p-10">
          <div className="mb-12 text-center">
            <div className="mx-auto h-1 max-w-md bg-gradient-to-r from-transparent via-rose to-transparent" />
            <p className="mt-3 text-xs tracking-[.3em] text-slate-500">
              SCREEN THIS WAY
            </p>
          </div>
          <div className="mx-auto grid max-w-xl gap-3">
            {[...new Set(show.seats.map((seat) => seat.seatNumber[0]))].map(
              (row) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-slate-500">{row}</span>
                  <div className="grid flex-1 grid-cols-5 gap-2 sm:grid-cols-8">
                    {show.seats
                      .filter((seat) => seat.seatNumber[0] === row)
                      .map((seat) => {
                        const chosen = selectedSeats.includes(seat.seatNumber);
                        const unavailable =
                          seat.status !== "AVAILABLE" && !chosen;
                        return (
                          <button
                            key={seat.seatNumber}
                            disabled={unavailable}
                            onClick={() =>
                              dispatch(toggleSeat(seat.seatNumber))
                            }
                            className={`aspect-square rounded-md text-xs font-semibold transition ${chosen ? "bg-sky-500 text-white" : unavailable ? (seat.status === "BOOKED" ? "bg-red-500/60 text-red-100" : "bg-amber/70 text-amber-950") : "bg-lime text-emerald-950 hover:scale-105"}`}
                          >
                            {seat.seatNumber.slice(1)}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-xs text-slate-400">
            <span>
              <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-lime" />
              Available
            </span>
            <span>
              <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-amber" />
              Locked
            </span>
            <span>
              <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-red-500" />
              Booked
            </span>
            <span>
              <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-sky-500" />
              Selected
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-sm text-slate-400">
              {selectedSeats.length} seats selected
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              ₹{selectedTotal}
            </p>
          </div>
          <button
            onClick={reserve}
            disabled={!selectedSeats.length}
            className="rounded-full bg-rose px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}
