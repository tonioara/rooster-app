import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import StaffTable from '../components/StaffTable';
import RosterTable from '../components/RosterTable';
import RequestsPanel from '../components/RequestsPanel';
import Toast from '../components/Toast';
import { useAdminNotifications } from '../hooks/useNotifications';
import { getUpcomingWeeks } from '../utils/weekUtils';

const WEEKS = getUpcomingWeeks(6);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [weekId, setWeekId] = useState('');
  const [roster, setRoster] = useState(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [generatingRoster, setGeneratingRoster] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const { pendingCount, toast, refresh } = useAdminNotifications();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const fetchStaff = async () => {
    try {
      const { data } = await API.get('/api/users/');
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading staff:', err.message);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleGenerateRoster = async () => {
    if (!weekId.trim()) return alert('⚠️ Please select a week first.');
    setGeneratingRoster(true);
    try {
      const { data } = await API.post('/api/roster/generate', { weekId });
      alert('✅ Roster generated successfully.');
      setRoster(data.roster);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Error generating roster.'}`);
    } finally {
      setGeneratingRoster(false);
    }
  };

  const handleGetRoster = async () => {
    if (!weekId.trim()) return alert('⚠️ Please select a week.');
    setLoadingRoster(true);
    try {
      const { data } = await API.get(`/api/roster/${weekId}`);
      setRoster(data);
    } catch {
      alert('❌ No roster found for this week.');
      setRoster(null);
    } finally {
      setLoadingRoster(false);
    }
  };

  const shiftsToShow = roster?.shifts || (Array.isArray(roster) ? roster : []);

  return (
    <div className="dashboard">
      <Toast toast={toast} />
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">◈</span>
          <span>RoosterApp</span>
        </div>
        <div className="dash-user">
          <span className="user-chip">{user?.name}</span>
          <span className="badge admin">Admin</span>
          <button className="btn-ghost"
            onClick={() => setShowRequests(!showRequests)}
            style={{ position: 'relative' }}>
            🔔
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--rose)', color: '#fff',
                borderRadius: '50%', width: '18px', height: '18px',
                fontSize: '0.65rem', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        {showRequests && (
          <RequestsPanel onUpdate={() => { refresh(); fetchStaff(); }} />
        )}

        <StaffTable staff={staff} onRefresh={fetchStaff} />

        <div className="roster-section">
          <div className="section-header">
            <h2>Roster Management</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{today}</span>
          </div>
          <div className="roster-query" style={{ marginBottom: '0.75rem' }}>
            <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ maxWidth: '280px' }}>
              <option value="">Select a week...</option>
              {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
            <button className="btn-accent" onClick={handleGenerateRoster} disabled={generatingRoster}>
              {generatingRoster ? 'Generating...' : '⚡ Generate'}
            </button>
            <button className="btn-primary" onClick={handleGetRoster} disabled={loadingRoster}>
              {loadingRoster ? 'Loading...' : 'View'}
            </button>
          </div>
          <RosterTable
            rosterData={shiftsToShow}
            weekId={roster?.weekId || weekId}
            dateViewed={today}
          />
        </div>
      </main>
    </div>
  );
}
