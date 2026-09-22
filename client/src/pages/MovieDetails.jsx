import { Link, useParams } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, Star } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovie } from "../redux/catalogSlice.js";
export default function MovieDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { movie, shows } = useSelector((state) => state.catalog);
  useEffect(() => {
    dispatch(fetchMovie(slug));
  }, [dispatch, slug]);
  if (!movie)
    return <div className="shell py-24 text-slate-400">Loading film...</div>;
  return (
    <div>
      <section className="border-b border-white/10 bg-black/20">
        <div className="shell grid gap-8 py-10 sm:grid-cols-[220px_1fr] sm:py-16">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="mx-auto aspect-[2/3] w-48 rounded-2xl object-cover sm:mx-0 sm:w-full"
          />
          <div className="self-end">
            <div className="flex items-center gap-2 text-sm text-amber">
              <Star size={15} fill="currentColor" /> {movie.rating?.toFixed(1)}{" "}
              · {movie.genres?.join(" / ")}
            </div>
            <h1 className="mt-3 font-display text-4xl text-white sm:text-6xl">
              {movie.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              {movie.synopsis}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Clock3 size={15} /> {movie.durationMinutes} minutes
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={15} />{" "}
                {new Date(movie.releaseDate).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="shell py-12">
        <h2 className="font-display text-3xl text-white">Choose a showtime</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shows.map((show) => (
            <Link
              key={show._id}
              to={`/shows/${show._id}/seats`}
              className="panel p-5 transition hover:border-rose/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-white">
                    <MapPin size={15} className="text-rose" />{" "}
                    {show.theatre?.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {show.screen?.name}
                  </p>
                </div>
                <span className="rounded-lg bg-rose/15 px-3 py-2 text-sm font-semibold text-rose">
                  {new Date(show.startsAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
