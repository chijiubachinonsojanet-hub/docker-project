const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 
  'mongodb://admin:secret123@mongo:27017/moviesdb?authSource=admin';

mongoose.connect(MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Movie Schema
const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  genre:       { type: String, required: true },
  year:        { type: Number, required: true },
  rating:      { type: Number, required: true },
  description: { type: String, required: true },
  image:       { type: String, required: true },
  featured:    { type: Boolean, default: false }
});

const Movie = mongoose.model('Movie', movieSchema);

// ── ROUTES ──────────────────────────────────────────

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a movie
app.post('/api/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a movie
app.delete('/api/movies/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'netwatch-backend' });
});

// Seed sample movies
app.post('/api/seed', async (req, res) => {
  try {
    await Movie.deleteMany({});
    const movies = [
      {
        title: "Inception", genre: "Sci-Fi", year: 2010,
        rating: 8.8, featured: true,
        description: "A thief who steals corporate secrets through dream-sharing technology.",
        image: "https://picsum.photos/seed/inception/300/450"
      },
      {
        title: "The Dark Knight", genre: "Action", year: 2008,
        rating: 9.0, featured: true,
        description: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy.",
        image: "https://picsum.photos/seed/darkknight/300/450"
      },
      {
        title: "Interstellar", genre: "Sci-Fi", year: 2014,
        rating: 8.6, featured: false,
        description: "A team of explorers travel through a wormhole in space.",
        image: "https://picsum.photos/seed/interstellar/300/450"
      },
      {
        title: "The Matrix", genre: "Sci-Fi", year: 1999,
        rating: 8.7, featured: true,
        description: "A hacker discovers the world is a simulation and joins a rebellion.",
        image: "https://picsum.photos/seed/matrix/300/450"
      },
      {
        title: "Avengers: Endgame", genre: "Action", year: 2019,
        rating: 8.4, featured: false,
        description: "The Avengers assemble once more to reverse Thanos actions.",
        image: "https://picsum.photos/seed/endgame/300/450"
      },
      {
        title: "The Godfather", genre: "Crime", year: 1972,
        rating: 9.2, featured: true,
        description: "The aging patriarch of an organized crime dynasty transfers control to his son.",
        image: "https://picsum.photos/seed/godfather/300/450"
      },
      {
        title: "Pulp Fiction", genre: "Crime", year: 1994,
        rating: 8.9, featured: false,
        description: "The lives of two hitmen, a boxer, and others intertwine in Los Angeles.",
        image: "https://picsum.photos/seed/pulpfiction/300/450"
      },
      {
        title: "The Lion King", genre: "Animation", year: 1994,
        rating: 8.5, featured: false,
        description: "A young lion prince flees his kingdom after the murder of his father.",
        image: "https://picsum.photos/seed/lionking/300/450"
      }
    ];
    await Movie.insertMany(movies);
    res.json({ message: '🎬 Movies seeded!', count: movies.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));