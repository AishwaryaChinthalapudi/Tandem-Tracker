const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedDates: [{
    type: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
