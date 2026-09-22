import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovies } from "../redux/catalogSlice.js";
import MovieCard from "../components/MovieCard.jsx";
export default function Movies() {
  const dispatch = useDispatch();
  const { movies, status } = useSelector((state) => state.catalog);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(
      () => dispatch(fetchMovies({ search, limit: 24 })),
      250,
    );
    return () => clearTimeout(timer);
  }, [dispatch, search]);
  return (
    <section className="shell py-12">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-rose">THE CATALOG</p>
          <h1 className="mt-2 font-display text-4xl text-white">All movies</h1>
        </div>
        <label className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>
      <div className="mt-10">
        {status === "loading" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[2/3] animate-pulse rounded-2xl bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
