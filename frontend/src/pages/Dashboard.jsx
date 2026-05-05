import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import MonthlySummary from '../components/MonthlySummary';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ title: '', description: '', targetDaysPerWeek: 7 });
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' or 'partner'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Axios config with token
  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  };

  useEffect(() => {
    if (loading) return; // Wait for initial AuthContext mount
    
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHabits();
  }, [user, loading, navigate]);

  const fetchHabits = async () => {
    try {
      const res = await axios.get('/api/habits', config);
      setHabits(res.data);
      setLoadingData(false);
    } catch (err) {
      console.error('Error fetching habits', err);
      setLoadingData(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.title) return;
    try {
      const res = await axios.post('/api/habits', newHabit, config);
      setHabits([...habits, res.data]);
      setNewHabit({ title: '', description: '', targetDaysPerWeek: 7 });
      setShowAddForm(false); // Close form on success
    } catch (err) {
      console.error('Error adding habit', err);
    }
  };

  const handleUpdateHabit = async (e) => {
    e.preventDefault();
    if (!editingHabit.title) return;
    try {
      const res = await axios.put(`/api/habits/${editingHabit._id}`, editingHabit, config);
      setHabits(habits.map(h => h._id === editingHabit._id ? res.data : h));
      setEditingHabit(null);
    } catch (err) {
      console.error('Error updating habit', err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit? All tracking history will be lost.')) {
      try {
        await axios.delete(`/api/habits/${habitId}`, config);
        setHabits(habits.filter(h => h._id !== habitId));
      } catch (err) {
        console.error('Error deleting habit', err);
      }
    }
  };

  const handleToggleDate = async (habitId, date) => {
    // Optimistic UI update
    setHabits(habits.map(habit => {
      if (habit._id === habitId) {
        const hasDate = habit.completedDates.includes(date);
        const updatedDates = hasDate 
          ? habit.completedDates.filter(d => d !== date)
          : [...habit.completedDates, date];
        return { ...habit, completedDates: updatedDates };
      }
      return habit;
    }));

    try {
      await axios.put(`/api/habits/${habitId}/toggle`, { date }, config);
    } catch (err) {
      console.error('Error toggling date', err);
      // If error, refresh to get real state
      fetchHabits();
    }
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/link', { partnerCode: partnerCodeInput }, config);
      alert('Partner linked successfully! Please log in again to refresh your data.');
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error linking partner');
    }
  };

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || loadingData) return <div className="loading">Loading dashboard...</div>;

  const myHabits = habits.filter(h => h.userId === user._id);
  const partnerHabits = habits.filter(h => h.userId !== user._id);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">Tandem Tracker</div>
        <div className="nav-user">
          <span className="partner-code-display">Your Code: <strong>{user.partnerCode}</strong></span>
          <button className="btn-outline" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user.username}!</h1>
          
          {!user.partnerId && (
            <div className="partner-link-card">
              <p>You don't have a partner yet.</p>
              <form onSubmit={handleLinkPartner} className="inline-form">
                <input 
                  type="text" 
                  value={partnerCodeInput} 
                  onChange={(e) => setPartnerCodeInput(e.target.value)} 
                  placeholder="Enter partner's 6-digit code"
                />
                <button type="submit" className="btn btn-secondary">Link Partner</button>
              </form>
            </div>
          )}
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            My Habits
          </button>
          <button 
            className={`tab-btn ${activeTab === 'partner' ? 'active' : ''}`}
            onClick={() => setActiveTab('partner')}
          >
            Partner's Habits
          </button>
          <button 
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Monthly Summary
          </button>
        </div>

        <div className="habits-section single-column">
          {activeTab === 'mine' && (
            <div className="my-habits column">
              <div className="section-header-row">
                <h2>My Habits</h2>
                <button 
                  className="btn-icon add-btn" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  title="Add new habit"
                >
                  {showAddForm ? '✕' : '+'}
                </button>
              </div>
              
              {showAddForm && (
                <form onSubmit={handleAddHabit} className="add-habit-form card animate-slide-down">
                  <h3>Add New Habit</h3>
                  <input 
                    type="text" 
                    placeholder="Habit Title" 
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Description (Optional)" 
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  />
                  <div className="form-group-inline">
                    <label>Target Days Per Week:</label>
                    <select 
                      value={newHabit.targetDaysPerWeek} 
                      onChange={(e) => setNewHabit({...newHabit, targetDaysPerWeek: Number(e.target.value)})}
                      className="inline-select"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'day' : 'days'}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Create Habit</button>
                </form>
              )}

              <div className="habits-list">
                {myHabits.length === 0 ? <p className="empty-state">No habits added yet.</p> : null}
                {myHabits.map(habit => (
                  <HabitCard 
                    key={habit._id} 
                    habit={habit} 
                    onToggle={handleToggleDate} 
                    onEdit={setEditingHabit}
                    onDelete={handleDeleteHabit}
                    isPartner={false} 
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'partner' && (
            <div className="partner-habits column">
              {!user.partnerId ? (
                <div className="empty-state card">
                  <p>Link a partner to see their progress here!</p>
                </div>
              ) : (
                <div className="habits-list">
                  {partnerHabits.length === 0 ? <p className="empty-state">Your partner hasn't added any habits yet.</p> : null}
                  {partnerHabits.map(habit => (
                    <HabitCard 
                      key={habit._id} 
                      habit={habit} 
                      onToggle={() => {}} // Can't toggle partner habits
                      isPartner={true} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <MonthlySummary habits={myHabits} />
          )}
        </div>
      </main>

      {editingHabit && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>Edit Habit</h3>
            <form onSubmit={handleUpdateHabit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={editingHabit.title}
                  onChange={(e) => setEditingHabit({...editingHabit, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={editingHabit.description}
                  onChange={(e) => setEditingHabit({...editingHabit, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Target Days Per Week</label>
                <select 
                  value={editingHabit.targetDaysPerWeek || 7} 
                  onChange={(e) => setEditingHabit({...editingHabit, targetDaysPerWeek: Number(e.target.value)})}
                  className="inline-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditingHabit(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
