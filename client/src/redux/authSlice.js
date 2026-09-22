import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api.js";
export const login = createAsyncThunk("auth/login", async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  localStorage.setItem("cinewave_token", data.token);
  return data;
});
export const register = createAsyncThunk(
  "auth/register",
  async (credentials) => {
    const { data } = await api.post("/auth/register", credentials);
    localStorage.setItem("cinewave_token", data.token);
    return data;
  },
);
const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("cinewave_token"),
    status: "idle",
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("cinewave_token");
    },
  },
  extraReducers: (builder) => {
    for (const action of [login, register])
      builder
        .addCase(action.pending, (state) => {
          state.status = "loading";
        })
        .addCase(action.fulfilled, (state, { payload }) => {
          state.status = "succeeded";
          state.user = payload.user;
          state.token = payload.token;
        })
        .addCase(action.rejected, (state) => {
          state.status = "failed";
        });
  },
});
export const { logout } = slice.actions;
export default slice.reducer;
