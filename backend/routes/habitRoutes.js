const express = require('express');
const router = express.Router();
const { getHabits, createHabit, toggleHabitDate, deleteHabit, updateHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

// All habit routes are protected
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .delete(deleteHabit)
  .put(updateHabit);
  
router.route('/:id/toggle').put(toggleHabitDate);

module.exports = router;
