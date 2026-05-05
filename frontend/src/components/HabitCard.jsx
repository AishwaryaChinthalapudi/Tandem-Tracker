import React, { useState } from 'react';

const HabitCard = ({ habit, onToggle, onEdit, onDelete, isPartner }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Robust local date formatter that always returns YYYY-MM-DD
  const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate the week from Monday to Sunday, offset by weekOffset
  const getWeekDays = () => {
    const dates = [];
    const today = new Date();
    
    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();
    
    // Calculate how many days to subtract to get to the most recent Monday
    // If today is Sunday (0), we go back 6 days. Otherwise, go back dayOfWeek - 1 days.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToSubtract - (weekOffset * 7));

    // Format 'today' as a string for exact matching in local timezone
    const todayString = getLocalDateString(today);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      const dateString = getLocalDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const isToday = dateString === todayString;
      
      dates.push({ dateString, dayName, dayNumber, isToday });
    }
    return dates;
  };

  const days = getWeekDays();

  // Calculate current streak robustly
  const calculateStreak = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let streak = 0;
    let checkDate = new Date();

    if (habit.completedDates.includes(todayStr)) {
      streak = 1;
      checkDate = today;
    } else if (habit.completedDates.includes(yesterdayStr)) {
      streak = 1;
      checkDate = yesterday;
    } else {
      return 0; // No active streak
    }

    // Work backwards safely using robust formatter
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = getLocalDateString(checkDate);
      if (habit.completedDates.includes(checkStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className={`habit-card ${isPartner ? 'partner-card' : ''}`}>
      <div className="habit-header">
        <div className="habit-title-row">
          <div className="habit-title-left">
            <h3>{habit.title}</h3>
            {currentStreak > 0 && (
              <div className="streak-badge" title="Current Streak">
                🔥 {currentStreak}
              </div>
            )}
          </div>
          {!isPartner && (
            <div className="habit-actions">
              <button className="action-btn edit-btn" onClick={() => onEdit(habit)} title="Edit Habit">✏️</button>
              <button className="action-btn delete-btn" onClick={() => onDelete(habit._id)} title="Delete Habit">🗑️</button>
            </div>
          )}
        </div>
        {habit.description && <p>{habit.description}</p>}
        {weekOffset !== 0 && (
          <div className="mini-week-label">
            Showing: {weekOffset > 0 ? `${weekOffset} Week${weekOffset > 1 ? 's' : ''} Ago` : `In ${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''}`}
          </div>
        )}
      </div>
      
      <div className="habit-tracker-carousel">
        <button 
          className="carousel-arrow" 
          onClick={() => setWeekOffset(w => w + 1)}
          title="Previous Week"
        >
          &larr;
        </button>
        <div className="habit-tracker-grid">
          {days.map((day) => {
            const isCompleted = habit.completedDates.includes(day.dateString);
            
            return (
              <div key={day.dateString} className="day-column">
                <div className="day-label-container">
                  <span className="day-name">{day.dayName}</span>
                  <span className="day-number">{day.dayNumber}</span>
                </div>
                <button
                  className={`tracker-btn ${isCompleted ? 'completed' : ''} ${day.isToday ? 'today-btn' : ''}`}
                  onClick={() => onToggle(habit._id, day.dateString)}
                  disabled={isPartner} // Cannot toggle partner's habits
                  title={day.dateString}
                >
                  {isCompleted ? '✓' : ''}
                </button>
                <div className="bottom-label">
                  {day.isToday && <span className="today-label">Today</span>}
                </div>
              </div>
            );
          })}
        </div>
        <button 
          className="carousel-arrow" 
          onClick={() => setWeekOffset(w => w - 1)}
          title="Next Week"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
