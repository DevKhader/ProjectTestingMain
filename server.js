const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://movielens_admin:movielenspassword@cluster0.cy68m.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Failed to connect to MongoDB Atlas", err));

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Movie schema and model
const movieSchema = new mongoose.Schema({
  title: String,
  poster: String,
  trailer: String,
  description: String,
  rating: Number,
  avgRating: { type: Number, default: 0 },  // Added avgRating to store the average rating
  reviews: [{ user: String, review: String, rating: Number }],
  actors: [String],  // Array of actors
  genre: [String],   // Movie genre
});

// Explicitly specify the collection name as 'movies'
const Movie = mongoose.model('Movie', movieSchema, 'movies');

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Search route
app.get('/movies', async (req, res) => {
  const searchQuery = req.query.search;
  try {
    const movies = await Movie.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { actors: { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
        { genre: { $regex: searchQuery, $options: 'i' } },
      ]
    });

    // Calculate average rating for each movie
    for (const movie of movies) {
      if (movie.reviews.length > 0) {
        const averageRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length;
        movie.avgRating = averageRating.toFixed(2);
      }
    }

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new review to a movie
app.post('/movies/:id/reviews', async (req, res) => {
  const movieId = req.params.id;
  const { review, rating, user } = req.body;

  if (!review || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Invalid review or rating." });
  }

  try {
    const movie = await Movie.findById(movieId);

    // Add the new review to the movie
    movie.reviews.push({ user: user || "Anonymous", review, rating });

    // Recalculate average rating
    const averageRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length;
    movie.avgRating = averageRating.toFixed(2);

    // Save the movie with the new review and updated average rating
    await movie.save();

    res.json(movie);  // Return the updated movie
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
