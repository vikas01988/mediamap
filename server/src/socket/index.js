export function configureSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join_show", (showId) => socket.join(`show:${showId}`));
    socket.on("leave_show", (showId) => socket.leave(`show:${showId}`));
    socket.on("seat_selected", ({ showId, seatNumber }) =>
      socket.to(`show:${showId}`).emit("seat_selected", { showId, seatNumber }),
    );
  });
}
