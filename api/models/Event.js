const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  link: {
    type: String,
    default: '#contact',
    trim: true
  },
  linkText: {
    type: String,
    default: "Plus d'informations",
    trim: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 