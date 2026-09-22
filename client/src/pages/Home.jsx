import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Play,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovies } from "../redux/catalogSlice.js";
import MovieCard from "../components/MovieCard.jsx";

const fallbackBackdrop =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85";

export default function Home() {
  const dispatch = useDispatch();
  const { movies, status } = useSelector((state) => state.catalog);
  useEffect(() => {
    dispatch(fetchMovies({ limit: 8 }));
  }, [dispatch]);
  const featured = movies[0];

  return (
    <div>
      <section className="shell pt-6 sm:pt-8">
        <div className="hero-stage relative min-h-[540px] overflow-hidden rounded-[2rem] border border-white/10">
          <img
            src={featured?.backdropUrl || fallbackBackdrop}
            alt="Cinema atmosphere"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,13,24,.96)_0%,rgba(9,13,24,.72)_42%,rgba(9,13,24,.12)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent" />
          <div className="relative flex min-h-[540px] max-w-2xl flex-col justify-end p-7 sm:p-12">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-[.18em] text-rose">
              <Sparkles size={16} /> THE NIGHT STARTS HERE
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl font-display text-5xl leading-[.95] text-white sm:text-7xl"
            >
              Stories feel bigger
              <br />
              <span className="text-rose">on the big screen.</span>
            </motion.h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              Find a film worth leaving home for, choose your seats, and make
              tonight feel like an occasion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/movies"
                className="flex items-center gap-2 rounded-full bg-rose px-5 py-3 font-semibold text-white transition hover:bg-rose/90"
              >
                Explore tonight <ArrowRight size={17} />
              </Link>
              <button className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-5 py-3 font-semibold text-white backdrop-blur hover:bg-white/10">
                <Play size={16} fill="currentColor" /> Watch trailers
              </button>
            </div>
            {featured && (
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-slate-300">
                <span className="flex items-center gap-1 text-amber">
                  <Star size={15} fill="currentColor" />{" "}
                  {featured.rating?.toFixed(1)} audience rating
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={15} /> Playing near Mumbai
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="shell -mt-1 py-7 sm:py-10">
        <div className="grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[.04] sm:grid-cols-4">
          <div className="px-4 py-5 sm:px-6">
            <p className="text-2xl font-semibold text-white">6</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Films playing
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <p className="text-2xl font-semibold text-white">40+</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Seats per screen
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <p className="text-2xl font-semibold text-white">5 min</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Seat hold
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <p className="text-2xl font-semibold text-white">1 tap</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              To your ticket
            </p>
          </div>
        </div>
      </section>
      <section className="shell pb-16 sm:pb-24">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[.16em] text-rose">
              CURATED FOR TONIGHT
            </p>
            <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
              What is calling you?
            </h2>
          </div>
          <Link
            to="/movies"
            className="hidden items-center gap-2 text-sm text-slate-300 sm:flex"
          >
            See the full catalogue <ChevronRight size={16} />
          </Link>
        </div>
        {status === "loading" && !movies.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[2/3] animate-pulse rounded-2xl bg-white/10"
              />
            ))}
          </div>
        ) : movies.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="panel grid min-h-64 place-items-center text-center text-slate-400">
            <div>
              <Search className="mx-auto mb-3 text-rose" />
              <p>Connect your catalog to start exploring.</p>
            </div>
          </div>
        )}
        <Link
          to="/movies"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-rose sm:hidden"
        >
          See the full catalogue <ArrowRight size={15} />
        </Link>
      </section>
      <section className="border-y border-white/10 bg-[#111b2d]">
        <div className="shell grid items-center gap-8 py-10 sm:grid-cols-[1fr_1.2fr] sm:py-14">
          <div>
            <p className="text-sm font-semibold tracking-[.16em] text-rose">
              MAKE IT A NIGHT
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl text-white sm:text-4xl">
              Good films deserve good plans.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-400">
              Find a theatre, settle into your favourite row, and let the
              outside world wait until the credits roll.
            </p>
            <Link
              to="/movies"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              Find a showtime <ArrowRight size={16} className="text-rose" />
            </Link>
          </div>
          <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 sm:h-64">
            <img
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=85"
              alt="Movie theatre seats"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111b2d]/70 to-transparent" />
          </div>
        </div>
      </section>
    </div>
  );
}
