import React from 'react';

const MonthlySummary = ({ habits }) => {
  // Get current date boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
  const totalDaysInMonth = endOfMonth.getDate();

  // Helper to check if a date string 'YYYY-MM-DD' falls within current month
  const isDateInCurrentMonth = (dateStr) => {
    const d = new Date(dateStr);
    return d >= startOfMonth && d <= endOfMonth;
  };

  // Calculate statistics
  let totalCompletionsThisMonth = 0;
  let totalPossibleCompletions = 0;
  let mostConsistentHabit = { title: 'None', count: 0 };

  const statsPerHabit = habits.map(habit => {
    // Count completions this month
    const completionsThisMonth = habit.completedDates.filter(isDateInCurrentMonth).length;
    
    // Calculate possible completions
    // targetDaysPerWeek (e.g. 3). So in a 4.3 week month, they should complete it ~12-13 times.
    // Formula: (targetDaysPerWeek / 7) * totalDaysInMonth
    const targetPerWeek = habit.targetDaysPerWeek || 7; // Fallback to 7 if missing
    const possibleCompletions = Math.round((targetPerWeek / 7) * totalDaysInMonth);
    
    // Accumulate global totals
    totalCompletionsThisMonth += completionsThisMonth;
    totalPossibleCompletions += possibleCompletions;

    // Track most consistent
    if (completionsThisMonth > mostConsistentHabit.count) {
      mostConsistentHabit = { title: habit.title, count: completionsThisMonth };
    }

    return {
      title: habit.title,
      completions: completionsThisMonth,
      possible: possibleCompletions,
      rate: possibleCompletions > 0 ? Math.round((completionsThisMonth / possibleCompletions) * 100) : 0
    };
  });

  // Global completion rate
  let globalRate = 0;
  if (totalPossibleCompletions > 0) {
    globalRate = Math.round((totalCompletionsThisMonth / totalPossibleCompletions) * 100);
    // Cap at 100% just in case they overachieved
    if (globalRate > 100) globalRate = 100;
  }

  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (habits.length === 0) {
    return (
      <div className="summary-container empty-state card">
        <p>Add some habits and check them off to see your monthly summary!</p>
      </div>
    );
  }

  return (
    <div className="summary-container">
      <h2>Summary for {currentMonthName}</h2>
      
      <div className="stat-grid">
        <div className="stat-card primary-stat">
          <div className="stat-value">{globalRate}%</div>
          <div className="stat-label">Overall Completion Rate</div>
          <div className="stat-subtext">Based on your target frequency</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{totalCompletionsThisMonth}</div>
          <div className="stat-label">Total Check-ins</div>
          <div className="stat-subtext">This month</div>
        </div>

        <div className="stat-card">
          <div className="stat-value text-ellipsis" title={mostConsistentHabit.title}>
            {mostConsistentHabit.title}
          </div>
          <div className="stat-label">Most Consistent Habit</div>
          <div className="stat-subtext">{mostConsistentHabit.count} days completed</div>
        </div>
      </div>

      <h3 className="breakdown-header">Habit Breakdown</h3>
      <div className="habit-breakdown-list">
        {statsPerHabit.map((stat, idx) => (
          <div key={idx} className="breakdown-item card">
            <div className="breakdown-info">
              <h4>{stat.title}</h4>
              <p>{stat.completions} / {stat.possible} target days</p>
            </div>
            <div className="breakdown-progress">
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${stat.rate >= 100 ? 'perfect' : ''}`}
                  style={{ width: `${Math.min(stat.rate, 100)}%` }}
                ></div>
              </div>
              <span className="progress-text">{stat.rate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlySummary;
