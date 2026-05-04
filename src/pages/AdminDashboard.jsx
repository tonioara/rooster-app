import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import StaffTable from '../components/StaffTable';
import RosterTable from '../components/RosterTable';
import RequestsPanel from '../components/RequestsPanel';
import ScheduleBuilder from '../components/ScheduleBuilder';
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
  const [showRequests, setShowRequests] = useState(false);
  const [activeTab, setActiveTab] = useState('roster');
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

  const handleSwitchRestaurant = () => navigate('/select-restaurant');

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

  const handleScheduleConfirmed = (data) => {
    setRoster(data.roster);
    setActiveTab('roster');
  };

  const shiftsToShow = roster?.shifts || [];
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="dashboard">
      <Toast toast={toast} />

      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">◈</span>
          <div>
            <span>RoosterApp</span>
            {/* ✅ Mostrar nombre del restaurante activo */}
            {user?.restaurantName && (
              <span style={{ fontSize: '0.7rem', color: 'var(--blush)', display: 'block', marginTop: '-2px' }}>
                {user.restaurantName}
              </span>
            )}
          </div>
        </div>
        <div className="dash-user">
          <span className="user-chip">{user?.name}</span>
          <span className="badge admin">{isSuperAdmin ? 'Super' : 'Admin'}</span>

          {/* ✅ Botón switch restaurant solo para superadmin */}
          {isSuperAdmin && (
            <button className="btn-ghost" onClick={handleSwitchRestaurant}
              title="Switch restaurant"
              style={{ fontSize: '0.8rem' }}>
              🏠 Switch
            </button>
          )}

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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('roster')}
            className={activeTab === 'roster' ? 'btn-primary' : 'btn-ghost'}
            style={{ flex: 1 }}>
            📋 View Roster
          </button>
          <button onClick={() => setActiveTab('builder')}
            className={activeTab === 'builder' ? 'btn-accent' : 'btn-ghost'}
            style={{ flex: 1 }}>
            ⚡ Build Schedule
          </button>
        </div>

        {activeTab === 'roster' && (
          <div className="roster-section">
            <div className="section-header">
              <h2>Roster</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{today}</span>
            </div>
            <div className="roster-query">
              <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ maxWidth: '280px' }}>
                <option value="">Select a week...</option>
                {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
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
        )}

        {activeTab === 'builder' && (
          <div>
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.4rem' }}>
                Week to schedule
              </label>
              <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ maxWidth: '100%' }}>
                <option value="">Select a week...</option>
                {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>
            {weekId ? (
              <ScheduleBuilder
                staff={staff.filter(s => s.role !== 'admin' && s.role !== 'superadmin')}
                weekId={weekId}
                onConfirmed={handleScheduleConfirmed}
              />
            ) : (
              <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <p>Select a week above to start building the schedule</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
