import { Movie } from "../models/Movie.js";
import { Screen, Theatre } from "../models/Theatre.js";
import { Show } from "../models/Show.js";

function seats(rows = ["A", "B", "C", "D", "E"], columns = 8) {
  return rows.flatMap((row) =>
    Array.from({ length: columns }, (_, index) => ({
      seatNumber: `${row}${index + 1}`,
      price: row === "A" ? 280 : 220,
    })),
  );
}

export async function seedDevelopmentData() {
  if (await Movie.exists()) return;

  const movies = await Movie.create([
    {
      title: "The Last Light",
      slug: "the-last-light",
      synopsis:
        "A gifted astronomer races across a changing city to deliver one final message before dawn.",
      posterUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=85",
      backdropUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85",
      genres: ["Drama", "Sci-Fi"],
      languages: ["English"],
      durationMinutes: 128,
      releaseDate: new Date("2026-08-14"),
      rating: 8.7,
    },
    {
      title: "Neon Monsoon",
      slug: "neon-monsoon",
      synopsis:
        "Two strangers, one rain-soaked night, and a city that refuses to let either of them go home.",
      posterUrl:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=85",
      backdropUrl:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85",
      genres: ["Romance", "Thriller"],
      languages: ["English", "Hindi"],
      durationMinutes: 114,
      releaseDate: new Date("2026-09-05"),
      rating: 8.2,
    },
  ]);

  const theatre = await Theatre.create({
    name: "Cinewave Central",
    address: "14 Aurora Avenue",
    city: "Mumbai",
    amenities: ["Dolby Atmos", "Recliner seats", "Parking"],
  });
  const screen = await Screen.create({
    theatre: theatre._id,
    name: "Screen 1",
    rows: 5,
    columns: 8,
    layout: seats().map(({ seatNumber }) => ({
      seatNumber,
      row: seatNumber[0],
      number: Number(seatNumber.slice(1)),
    })),
  });
  await Theatre.findByIdAndUpdate(theatre._id, { screens: [screen._id] });

  const firstShow = new Date();
  firstShow.setDate(firstShow.getDate() + 1);
  firstShow.setHours(18, 30, 0, 0);
  const secondShow = new Date(firstShow);
  secondShow.setHours(21, 15, 0, 0);
  await Show.create([
    {
      movie: movies[0]._id,
      theatre: theatre._id,
      screen: screen._id,
      startsAt: firstShow,
      seats: seats(),
    },
    {
      movie: movies[1]._id,
      theatre: theatre._id,
      screen: screen._id,
      startsAt: secondShow,
      seats: seats(),
    },
  ]);
  console.log("Development catalog seeded");
}

export async function seedAdditionalMovies() {
  const theatre = await Theatre.findOne({ name: "Cinewave Central" });
  const screen = theatre
    ? await Screen.findOne({ theatre: theatre._id })
    : null;
  if (!theatre || !screen) return;

  const catalog = [
    [
      "Midnight Frequency",
      "midnight-frequency",
      "A pirate radio host discovers a signal that changes the city after dark.",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=85",
      ["Mystery", "Drama"],
      ["English"],
      121,
      8.5,
    ],
    [
      "Paper Planets",
      "paper-planets",
      "A young cartographer redraws her world one impossible journey at a time.",
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=700&q=85",
      ["Adventure", "Family"],
      ["English", "Hindi"],
      106,
      8.1,
    ],
    [
      "The Green Room",
      "the-green-room",
      "Behind a perfect performance, three artists decide what they are willing to lose.",
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=700&q=85",
      ["Comedy", "Drama"],
      ["English"],
      98,
      7.9,
    ],
    [
      "After the Rain",
      "after-the-rain",
      "Two old friends return to their hometown and find the future waiting in familiar places.",
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
      ["Romance", "Drama"],
      ["English", "Tamil"],
      117,
      8.3,
    ],
  ];

  for (const [
    title,
    slug,
    synopsis,
    posterUrl,
    genres,
    languages,
    durationMinutes,
    rating,
  ] of catalog) {
    const movie = await Movie.findOneAndUpdate(
      { slug },
      {
        title,
        slug,
        synopsis,
        posterUrl,
        genres,
        languages,
        durationMinutes,
        rating,
        releaseDate: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!(await Show.exists({ movie: movie._id }))) {
      const startsAt = new Date(
        Date.now() +
          (catalog.findIndex((item) => item[1] === slug) + 1) * 86_400_000,
      );
      startsAt.setHours(
        17 + (catalog.findIndex((item) => item[1] === slug) % 3),
        30,
        0,
        0,
      );
      await Show.create({
        movie: movie._id,
        theatre: theatre._id,
        screen: screen._id,
        startsAt,
        seats: seats(),
      });
    }
  }
}
