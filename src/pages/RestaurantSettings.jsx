import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import API from '../api/client';

export default function RestaurantSettings({ onClose }) {
  const [info, setInfo] = useState({
    name: '', address: '',
    openTime: '10:30', closeTime: '22:00',
    lunchStart: '10:30', lunchEnd: '15:00',
    dinnerStart: '17:00', dinnerEnd: '22:00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/api/restaurants/my');
        setInfo({
          name: data.name || '',
          address: data.address || '',
          openTime: data.openTime || '10:30',
          closeTime: data.closeTime || '22:00',
          lunchStart: data.lunchStart || '10:30',
          lunchEnd: data.lunchEnd || '15:00',
          dinnerStart: data.dinnerStart || '17:00',
          dinnerEnd: data.dinnerEnd || '22:00',
        });
      } catch {}
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.put('/api/restaurants/my', info);
      toast.success('✅ Settings saved', { description: 'Restaurant info updated' });
      if (typeof onClose === 'function') onClose();
    } catch {
      toast.error('Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2>Restaurant Settings</h2>
        {onClose && <button onClick={onClose} className="btn-ghost" style={{ fontSize: '0.8rem' }}>✕ Close</button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Info básica */}
        <div style={{ padding: '1rem', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
            🏠 Restaurant info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="field-group">
              <label>Name</label>
              <input type="text" value={info.name}
                onChange={e => setInfo({ ...info, name: e.target.value })}
                placeholder="Restaurant name" />
            </div>
            <div className="field-group">
              <label>Address</label>
              <input type="text" value={info.address}
                onChange={e => setInfo({ ...info, address: e.target.value })}
                placeholder="Address" />
            </div>
          </div>
        </div>

        {/* Horarios generales */}
        <div style={{ padding: '1rem', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
            🕐 Opening hours
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Opens at</label>
              <input type="time" value={info.openTime}
                onChange={e => setInfo({ ...info, openTime: e.target.value })} />
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Closes at</label>
              <input type="time" value={info.closeTime}
                onChange={e => setInfo({ ...info, closeTime: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ✅ Cortes de servicio */}
        <div style={{ padding: '1rem', background: 'var(--cream)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
            🍽️ Service cuts
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
            Define when Lunch and Dinner start and end. The Schedule Builder will use these to split shifts.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', padding: '0.75rem', background: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b8860b', marginBottom: '0.5rem' }}>🌅 Lunch</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="field-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem' }}>Start</label>
                  <input type="time" value={info.lunchStart}
                    onChange={e => setInfo({ ...info, lunchStart: e.target.value })} />
                </div>
                <div className="field-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem' }}>End</label>
                  <input type="time" value={info.lunchEnd}
                    onChange={e => setInfo({ ...info, lunchEnd: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px', padding: '0.75rem', background: '#e8eaf6', borderRadius: '8px', border: '1px solid #9fa8da' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3949ab', marginBottom: '0.5rem' }}>🌙 Dinner</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="field-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem' }}>Start</label>
                  <input type="time" value={info.dinnerStart}
                    onChange={e => setInfo({ ...info, dinnerStart: e.target.value })} />
                </div>
                <div className="field-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.72rem' }}>End</label>
                  <input type="time" value={info.dinnerEnd}
                    onChange={e => setInfo({ ...info, dinnerEnd: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', padding: '0.5rem 0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid var(--border)' }}>
            🌅 Lunch: <strong>{info.lunchStart} — {info.lunchEnd}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            🌙 Dinner: <strong>{info.dinnerStart} — {info.dinnerEnd}</strong>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={loading}
          style={{ padding: '0.75rem' }}>
          {loading ? 'Saving...' : '💾 Save settings'}
        </button>
      </div>
    </div>
  );
}
