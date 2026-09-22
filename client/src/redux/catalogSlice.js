import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api.js";
export const fetchMovies = createAsyncThunk(
  "catalog/movies",
  async (params = {}) => (await api.get("/movies", { params })).data,
);
export const fetchMovie = createAsyncThunk(
  "catalog/movie",
  async (slug) => (await api.get(`/movies/${slug}`)).data,
);
const slice = createSlice({
  name: "catalog",
  initialState: { movies: [], movie: null, shows: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMovies.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.movies = payload.movies;
      })
      .addCase(fetchMovies.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchMovie.fulfilled, (state, { payload }) => {
        state.movie = payload.movie;
        state.shows = payload.shows;
      });
  },
});
export default slice.reducer;
