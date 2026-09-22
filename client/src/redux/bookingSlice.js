import { createSlice } from "@reduxjs/toolkit";
const slice = createSlice({
  name: "booking",
  initialState: { show: null, selectedSeats: [], booking: null },
  reducers: {
    setShow(state, { payload }) {
      state.show = payload;
      state.selectedSeats = [];
      state.booking = null;
    },
    toggleSeat(state, { payload }) {
      state.selectedSeats = state.selectedSeats.includes(payload)
        ? state.selectedSeats.filter((seat) => seat !== payload)
        : [...state.selectedSeats, payload];
    },
    setBooking(state, { payload }) {
      state.booking = payload;
    },
    patchSeats(state, { payload }) {
      if (!state.show || state.show._id !== payload.showId) return;
      for (const incoming of payload.seats || []) {
        const seat = state.show.seats.find(
          (item) => item.seatNumber === incoming.seatNumber,
        );
        if (seat) Object.assign(seat, incoming);
      }
    },
  },
});
export const { setShow, toggleSeat, setBooking, patchSeats } = slice.actions;
export default slice.reducer;
