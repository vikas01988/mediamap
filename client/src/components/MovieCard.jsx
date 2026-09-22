import { Link } from "react-router-dom";
import { Star } from "lucide-react";
export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.slug}`} className="group block">
      <div className="movie-card-image relative aspect-[2/3] overflow-hidden rounded-2xl bg-slate-800">
        <img
          src={
            movie.posterUrl ||
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80"
          }
          alt={movie.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 pt-20">
          <span className="flex items-center gap-1 text-xs text-amber">
            <Star size={13} fill="currentColor" />{" "}
            {movie.rating?.toFixed(1) || "New"}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="truncate font-semibold text-white">{movie.title}</h3>
        <span className="shrink-0 text-xs text-slate-500">
          {movie.durationMinutes || 0}m
        </span>
      </div>
      <p className="mt-1 truncate text-sm text-slate-400">
        {movie.genres?.slice(0, 2).join(" · ") || movie.languages?.join(" · ")}
      </p>
    </Link>
  );
}
