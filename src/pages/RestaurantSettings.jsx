import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function RestaurantSettings({ onClose }) {
  const [info, setInfo] = useState({ name: '', address: '', openTime: '10:30', closeTime: '22:00' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/api/restaurants/my');
        setInfo({
          name: data.name || '',
          address: data.address || '',
          openTime: data.openTime || '10:30',
          closeTime: data.closeTime || '22:00',
        });
      } catch {}
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.put('/api/restaurants/my', info);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--border)',
      borderRadius: '16px', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Restaurant Settings</h2>
        {onClose && (
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: '0.8rem' }}>✕ Close</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="field-group">
          <label>Restaurant name</label>
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

        <button className="btn-primary" onClick={handleSave} disabled={loading}
          style={{ padding: '0.75rem' }}>
          {loading ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save changes'}
        </button>
      </div>
    </div>
  );
}
