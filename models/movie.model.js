const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  genre: [{
    type: String,
    enum: ['Action','Drama','Comedy','Thriller','Fantasy','Romance','Sports','Musical']
  }],
  director: {
    type: String,
    required: true,
  },
  actors: [{
    type: String,
  }],
  language: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  plot: {
    type: String,
  },
  awards: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
  trailerUrl: {
    type: String,
  },
  ratings: [
    {
      type: Number,
      min: 0,
      max: 10,
    }
  ],
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,      
    }
  ]
}, {
  timestamps: true,
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;