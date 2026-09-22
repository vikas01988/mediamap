import { Movie } from "../models/Movie.js";
import { Show } from "../models/Show.js";
export async function listMovies(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(24, Math.max(1, Number(req.query.limit || 12)));
    const filter = { isPublished: true };
    if (req.query.genre) filter.genres = req.query.genre;
    if (req.query.language) filter.languages = req.query.language;
    if (req.query.search) filter.$text = { $search: req.query.search };
    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ rating: -1, releaseDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Movie.countDocuments(filter),
    ]);
    res.json({ movies, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}
export async function movieDetails(req, res, next) {
  try {
    const movie = await Movie.findOne({
      slug: req.params.slug,
      isPublished: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const shows = await Show.find({
      movie: movie._id,
      startsAt: { $gte: new Date() },
      isActive: true,
    })
      .populate("theatre screen")
      .sort({ startsAt: 1 });
    res.json({ movie, shows });
  } catch (error) {
    next(error);
  }
}
export async function showDetails(req, res, next) {
  try {
    const show = await Show.findById(req.params.id).populate(
      "movie theatre screen",
    );
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ show });
  } catch (error) {
    next(error);
  }
}
