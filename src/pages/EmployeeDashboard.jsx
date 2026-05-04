import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import RosterTable from '../components/RosterTable';
import RequestForm from '../components/RequestForm';
import Toast from '../components/Toast';
import { useEmployeeNotifications } from '../hooks/useNotifications';
import { getUpcomingWeeks, getWeekId } from '../utils/weekUtils';

const WEEKS = getUpcomingWeeks(6);

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // ✅ Arranca con la semana actual seleccionada
  const [weekId, setWeekId] = useState(() => getWeekId(new Date()));
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const { toast } = useEmployeeNotifications(user?._id);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleGetRoster = async (id) => {
    const wid = id || weekId;
    if (!wid) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/api/roster/${wid}`);
      setRoster(data);
    } catch {
      setRoster(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Carga el roster de la semana actual automáticamente al entrar
  useEffect(() => {
    handleGetRoster(getWeekId(new Date()));
  }, []);

  const handleWeekChange = (e) => {
    setWeekId(e.target.value);
    handleGetRoster(e.target.value);
  };

  const allShifts = roster?.shifts || [];
  const myShifts = allShifts.filter(
    s => s.employee?._id === user?._id || s.employee === user?._id
  );

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
          <span className="badge employee">{user?.role}</span>
          <button className="btn-ghost" onClick={() => setShowRequest(!showRequest)}>
            📨 Solicitar
          </button>
          <button className="btn-ghost" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <main className="dash-main">
        {showRequest && <RequestForm onSuccess={() => setShowRequest(false)} />}

        <div className="employee-card">
          <h2>Mi Perfil</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Nombre</span>
              <span>{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rol</span>
              <span className="badge employee">{user?.role}</span>
            </div>
            {user?.skills?.length > 0 && (
              <div className="info-row">
                <span className="info-label">Habilidades</span>
                <div className="skills-list">
                  {user.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="roster-section">
          <div className="section-header">
            <h2>Mi Horario Semanal</h2>
          </div>
          <div className="roster-query">
            <select value={weekId} onChange={handleWeekChange} style={{ maxWidth: '280px' }}>
              <option value="">Seleccioná una semana...</option>
              {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
            <button className="btn-primary" onClick={() => handleGetRoster(weekId)} disabled={loading}>
              {loading ? 'Buscando...' : 'Ver horario'}
            </button>
          </div>

          {loading && (
            <p style={{ color: 'var(--ink-muted)', padding: '1rem', textAlign: 'center' }}>
              Cargando horario...
            </p>
          )}

          {!loading && roster && myShifts.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', padding: '1rem', textAlign: 'center' }}>
              No tenés turnos asignados esta semana.
            </p>
          )}

          {!loading && roster && myShifts.length > 0 && (
            <RosterTable
              rosterData={myShifts}
              weekId={roster?.weekId || weekId}
              dateViewed={new Date().toLocaleDateString('es-ES')}
            />
          )}

          {!loading && !roster && (
            <p style={{ color: 'var(--ink-muted)', padding: '1rem', textAlign: 'center' }}>
              No hay roster generado para esta semana todavía.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
