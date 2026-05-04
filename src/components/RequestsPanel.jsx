import { useEffect, useState } from 'react';
import API from '../api/client';
import { weekIdToLabel } from '../utils/weekUtils';

const TYPE_LABEL = {
  dayOff: '📅 Día libre',
  scheduleChange: '🕐 Cambio de horario',
};

const STATUS_STYLE = {
  Pending:  { bg: '#fff8e1', color: '#b8860b', label: '⏳ Pendiente' },
  Approved: { bg: '#e8f5e9', color: '#2e7d32', label: '✅ Aprobada' },
  Rejected: { bg: '#fde8e8', color: '#c0392b', label: '❌ Rechazada' },
};

export default function RequestsPanel({ onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/requests/pending');
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    try {
      await API.patch(`/api/requests/${id}/status`, { status });
      await fetchRequests();
      // ✅ Notificar al padre para que refresque el contador
      if (typeof onUpdate === 'function') onUpdate();
    } catch {
      alert('❌ Error al actualizar la solicitud.');
    }
  };

  const filtered = requests.filter(r =>
    filter === 'all' ? true : r.status === filter
  );
  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="requests-panel">
      <div className="section-header">
        <h2>
          📋 Solicitudes
          {pendingCount > 0 && (
            <span style={{
              marginLeft: '0.5rem', background: 'var(--rose)', color: '#fff',
              borderRadius: '20px', padding: '0.1rem 0.5rem',
              fontSize: '0.72rem', fontWeight: '700',
            }}>
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['Pending', 'Approved', 'Rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary small' : 'btn-ghost small'}>
              {f === 'Pending' ? 'Pendientes' :
               f === 'Approved' ? 'Aprobadas' :
               f === 'Rejected' ? 'Rechazadas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--ink-muted)', padding: '1rem 0' }}>Cargando...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-muted)' }}>
          No hay solicitudes {filter === 'Pending' ? 'pendientes' : 'en esta categoría'}.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
        {filtered.map(req => {
          const st = STATUS_STYLE[req.status] || STATUS_STYLE.Pending;
          return (
            <div key={req._id} style={{
              background: '#fff', border: '1.5px solid var(--border)',
              borderRadius: '12px', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {req.userId?.name || 'Empleado'}
                  </strong>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.15rem 0.5rem',
                    borderRadius: '20px', background: st.bg, color: st.color, fontWeight: '700',
                  }}>
                    {st.label}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.2rem' }}>
                  {TYPE_LABEL[req.type] || '📝 Solicitud'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                  📅 <strong>{weekIdToLabel(req.weekReference)}</strong> — <strong>{req.requestedDayOff}</strong>
                </div>
                {req.note && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--ink-soft)', fontStyle: 'italic',
                    marginTop: '0.3rem', padding: '0.4rem 0.6rem',
                    background: 'var(--cream)', borderRadius: '6px',
                  }}>
                    "{req.note}"
                  </div>
                )}
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '0.4rem' }}>
                  {new Date(req.timestamp).toLocaleDateString('es-ES', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              {req.status === 'Pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="btn-primary small"
                    onClick={() => handleAction(req._id, 'Approved')}
                    style={{ background: '#2e7d32' }}>
                    ✅ Aprobar
                  </button>
                  <button className="btn-danger small"
                    onClick={() => handleAction(req._id, 'Rejected')}>
                    ❌ Rechazar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
