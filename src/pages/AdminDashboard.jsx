import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api/client';
import StaffTable from '../components/StaffTable';
import RosterTable from '../components/RosterTable';
import RosterEditor from '../components/RosterEditor';
import RequestsPanel from '../components/RequestsPanel';
import ScheduleBuilder from '../components/ScheduleBuilder';
import RestaurantSettings from './RestaurantSettings';
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
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('roster');
  const { pendingCount, refresh } = useAdminNotifications();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const fetchStaff = async () => {
    try {
      const { data } = await API.get('/api/users/');
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Error loading staff');
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSwitchRestaurant = () => navigate('/select-restaurant');

  const handleGetRoster = async (wid) => {
    const w = wid || weekId;
    if (!w?.trim()) return toast.warning('Please select a week first.');
    setLoadingRoster(true);
    try {
      const { data } = await API.get(`/api/roster/${w}`);
      setRoster(data);
    } catch {
      toast.error('No roster found for this week.');
      setRoster(null);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleScheduleConfirmed = (data) => {
    setRoster(data.roster);
    toast.success('✅ Schedule confirmed!', { description: `Week ${weekId} saved` });
    setActiveTab('roster');
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const shiftsToShow = roster?.shifts || [];

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">◈</span>
          <div>
            <span>RoosterApp</span>
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
          <button className="btn-ghost" onClick={() => setShowSettings(!showSettings)} title="Restaurant settings">⚙️</button>
          {isSuperAdmin && (
            <button className="btn-ghost" onClick={handleSwitchRestaurant} style={{ fontSize: '0.8rem' }}>
              🏠 Switch
            </button>
          )}
          <button className="btn-ghost" onClick={() => setShowRequests(!showRequests)} style={{ position: 'relative' }}>
            🔔
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--rose)', color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '700',
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
        {showRequests && <RequestsPanel onUpdate={() => { refresh(); fetchStaff(); }} />}
        {showSettings && <RestaurantSettings onClose={() => setShowSettings(false)} />}

        <StaffTable staff={staff} onRefresh={fetchStaff} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'roster', label: '📋 View' },
            { id: 'builder', label: '⚡ Build' },
            { id: 'edit', label: '✏️ Edit' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'edit' && weekId && !roster) handleGetRoster();
              }}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1, fontSize: '0.82rem' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selector de semana */}
        <div style={{
          background: 'var(--card)', border: '1.5px solid var(--border)',
          borderRadius: '12px', padding: '0.85rem 1rem',
          display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ flex: 1, maxWidth: '280px' }}>
            <option value="">Select a week...</option>
            {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
          {(activeTab === 'roster' || activeTab === 'edit') && (
            <button className="btn-primary" onClick={() => handleGetRoster()} disabled={loadingRoster || !weekId}>
              {loadingRoster ? 'Loading...' : 'Load'}
            </button>
          )}
        </div>

        {/* TAB: View */}
        {activeTab === 'roster' && (
          <div className="roster-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2>Roster</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{today}</span>
            </div>
            <RosterTable rosterData={shiftsToShow} weekId={roster?.weekId || weekId} dateViewed={today} />
          </div>
        )}

        {/* TAB: Build */}
        {activeTab === 'builder' && (
          weekId ? (
            <ScheduleBuilder
              staff={staff.filter(s => s.role !== 'admin' && s.role !== 'superadmin')}
              weekId={weekId}
              onConfirmed={handleScheduleConfirmed}
            />
          ) : (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <p>Select a week above to build the schedule</p>
            </div>
          )
        )}

        {/* TAB: Edit */}
        {activeTab === 'edit' && (
          weekId && roster ? (
            <RosterEditor roster={roster} weekId={weekId} onSaved={() => handleGetRoster()} />
          ) : (
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✏️</div>
              <p style={{ marginBottom: '1rem' }}>Load a roster to start editing</p>
              <button className="btn-primary" onClick={() => handleGetRoster()} disabled={!weekId || loadingRoster}>
                {loadingRoster ? 'Loading...' : 'Load roster'}
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}
