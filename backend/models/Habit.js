const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a habit title'],
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  targetDaysPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
    default: 7
  },
  // Simple array to store dates when the habit was completed (e.g., '2026-05-05')
  completedDates: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
