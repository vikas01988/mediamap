import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../redux/authSlice.js";

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const action = mode === "login" ? login : register;
      const result = await dispatch(action(form)).unwrap();
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      navigate(result.user.role === "admin" ? "/admin" : "/movies");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to complete authentication",
      );
    }
  }

  return (
    <section className="shell grid min-h-[calc(100vh-170px)] items-center py-12">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/[.06] shadow-2xl shadow-black/20 md:grid-cols-[.9fr_1.1fr]">
        <div className="hidden bg-rose p-10 md:block">
          <p className="text-sm font-semibold tracking-[.2em] text-rose-950">
            CINEWAVE MEMBERS
          </p>
          <h1 className="mt-20 font-display text-5xl leading-tight text-white">
            The best seat in the house is waiting.
          </h1>
          <p className="mt-6 leading-7 text-rose-100">
            Keep your tickets close, move through checkout faster, and never
            lose track of a night out.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="flex gap-6 border-b border-white/10">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`pb-3 text-sm font-semibold ${mode === "login" ? "border-b-2 border-rose text-white" : "text-slate-500"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`pb-3 text-sm font-semibold ${mode === "register" ? "border-b-2 border-rose text-white" : "text-slate-500"}`}
            >
              Create account
            </button>
          </div>
          <h2 className="mt-8 font-display text-3xl text-white">
            {mode === "login" ? "Welcome back" : "Join Cinewave"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "login"
              ? "Sign in to manage your bookings."
              : "Your next movie night starts here."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                <UserRound size={17} className="text-slate-500" />
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your name"
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                />
              </label>
            )}
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <Mail size={17} className="text-slate-500" />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="Email address"
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <LockKeyhole size={17} className="text-slate-500" />
              <input
                required
                minLength={8}
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Password (8+ characters)"
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </label>
            <button
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose px-5 py-3 font-semibold text-white transition hover:bg-rose/90 disabled:cursor-wait disabled:opacity-60"
            >
              {status === "loading"
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Back to{" "}
            <Link to="/movies" className="text-rose hover:underline">
              movie listings
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
