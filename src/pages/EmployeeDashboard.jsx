import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import RosterTable from '../components/RosterTable';
import RequestForm from '../components/RequestForm';
import { getUpcomingWeeks } from '../utils/weekUtils';

const WEEKS = getUpcomingWeeks(6);

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [weekId, setWeekId] = useState('');
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleGetRoster = async () => {
    if (!weekId.trim()) return alert('⚠️ Seleccioná una semana.');
    setLoading(true);
    try {
      const { data } = await API.get(`/api/roster/${weekId}`);
      setRoster(data);
    } catch {
      alert('❌ No se encontró roster para esa semana.');
      setRoster(null);
    } finally {
      setLoading(false);
    }
  };

  const allShifts = roster?.shifts || [];
  const myShifts = allShifts.filter(
    s => s.employee?._id === user?._id || s.employee === user?._id
  );

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">◈</span>
          <span>RoosterApp</span>
        </div>
        <div className="dash-user">
          <span className="user-chip">{user?.name}</span>
          <span className="badge employee">{user?.role}</span>
          <button className="btn-ghost"
            onClick={() => setShowRequest(!showRequest)}>
            📨 Solicitar
          </button>
          <button className="btn-ghost" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <main className="dash-main">
        {showRequest && (
          <RequestForm onSuccess={() => setShowRequest(false)} />
        )}

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
                  {user.skills.map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
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
            <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{ maxWidth: '280px' }}>
              <option value="">Seleccioná una semana...</option>
              {WEEKS.map(w => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleGetRoster} disabled={loading}>
              {loading ? 'Buscando...' : 'Ver horario'}
            </button>
          </div>
          {roster && (
            <RosterTable
              rosterData={myShifts.length > 0 ? myShifts : allShifts}
              weekId={roster?.weekId || weekId}
              dateViewed={new Date().toLocaleDateString('es-ES')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
