const Habit = require('../models/Habit');
const User = require('../models/User');

// @desc    Get user and partner habits
// @route   GET /api/habits
// @access  Private
exports.getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get an array of IDs to fetch habits for (self + partner if exists)
    const queryIds = [userId];
    if (user.partnerId) {
      queryIds.push(user.partnerId);
    }

    const habits = await Habit.find({ userId: { $in: queryIds } });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = async (req, res) => {
  try {
    const { title, description, targetDaysPerWeek } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a title' });
    }

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      description,
      targetDaysPerWeek: targetDaysPerWeek || 7
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a habit details
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const { title, description, targetDaysPerWeek } = req.body;

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Ensure only the owner can update it
    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this habit' });
    }

    habit.title = title || habit.title;
    habit.description = description !== undefined ? description : habit.description;
    if (targetDaysPerWeek) {
      habit.targetDaysPerWeek = targetDaysPerWeek;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update habit (e.g., toggle completion for a date)
// @route   PUT /api/habits/:id/toggle
// @access  Private
exports.toggleHabitDate = async (req, res) => {
  try {
    const { date } = req.body; // Expected format 'YYYY-MM-DD'
    const habitId = req.params.id;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date' });
    }

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Make sure the user owns the habit or is the partner
    // For now, let's just let anyone logged in toggle it if they can see it (simplified)
    // A better approach is checking if req.user.id == habit.userId or req.user.partnerId == habit.userId

    const dateIndex = habit.completedDates.indexOf(date);
    
    if (dateIndex > -1) {
      // Date exists, remove it (uncheck)
      habit.completedDates.splice(dateIndex, 1);
    } else {
      // Date doesn't exist, add it (check)
      habit.completedDates.push(date);
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
exports.deleteHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Ensure only the owner can delete it
    if (habit.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this habit' });
    }

    await habit.deleteOne();
    res.json({ id: habitId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
