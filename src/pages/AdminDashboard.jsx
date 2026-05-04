import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import StaffTable from '../components/StaffTable';
import RosterTable from '../components/RosterTable';
import NotificationButton from '../components/NotificationButton';
import RequestsBell from '../components/RequestsBell';
import RequestsPanel from '../components/RequestsPanel';
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

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const fetchStaff = async () => {
    try {
      const { data } = await API.get('/api/users/');
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar staff:', err.response?.data || err.message);
      setStaff([]);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleGenerateRoster = async () => {
    if (!weekId.trim()) return alert('⚠️ Seleccioná una semana primero.');
    setGeneratingRoster(true);
    try {
      const { data } = await API.post('/api/roster/generate', { weekId });
      alert('✅ Roster generado con días libres aprobados.');
      setRoster(data.roster);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al generar roster.';
      alert(`❌ ${msg}`);
    } finally {
      setGeneratingRoster(false);
    }
  };

  const handleGetRoster = async () => {
    if (!weekId.trim()) return alert('⚠️ Seleccioná una semana.');
    setLoadingRoster(true);
    try {
      const { data } = await API.get(`/api/roster/${weekId}`);
      setRoster(data);
    } catch {
      alert('❌ No se encontró roster para esa semana.');
      setRoster(null);
    } finally {
      setLoadingRoster(false);
    }
  };

  const shiftsToShow = roster?.shifts || (Array.isArray(roster) ? roster : []);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">◈</span>
          <span>RoosterApp</span>
        </div>
        <div className="dash-user">
          <span className="user-chip">{user?.name}</span>
          <span className="badge admin">Admin</span>
          <RequestsBell onClick={() => setShowRequests(!showRequests)} />
          <button className="btn-ghost" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <main className="dash-main">
        {showRequests && <RequestsPanel onUpdate={fetchStaff} />}

        <StaffTable staff={staff} onRefresh={fetchStaff} />

        <div className="roster-section">
          <div className="section-header">
            <h2>Gestión de Roster</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{today}</span>
          </div>
          <div className="roster-query" style={{ marginBottom: '0.75rem' }}>
            <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ maxWidth: '280px' }}>
              <option value="">Seleccioná una semana...</option>
              {WEEKS.map(w => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
            <button className="btn-accent" onClick={handleGenerateRoster} disabled={generatingRoster}>
              {generatingRoster ? 'Generando...' : '⚡ Generar'}
            </button>
            <button className="btn-primary" onClick={handleGetRoster} disabled={loadingRoster}>
              {loadingRoster ? 'Buscando...' : 'Consultar'}
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
