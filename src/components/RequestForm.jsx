import { useState } from 'react';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getUpcomingWeeks } from '../utils/weekUtils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKS = getUpcomingWeeks(6);

export default function RequestForm({ onSuccess }) {
  const { user } = useAuth();
  const [type, setType] = useState('dayOff');
  const [week, setWeek] = useState('');
  const [day, setDay] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!week || !day) return alert('⚠️ Please select week and day.');
    setLoading(true);
    try {
      await API.post('/api/requests', { userId: user._id, weekReference: week, requestedDayOff: day, type, note });
      setSent(true);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Could not send request.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="request-success">
        <span style={{ fontSize: '2rem' }}>✅</span>
        <p>Request sent! Amber will review it soon.</p>
        <button className="btn-ghost" onClick={() => setSent(false)}>Send another request</button>
      </div>
    );
  }

  return (
    <div className="request-form-card">
      <h2>New Request</h2>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Your request will be sent to Amber for approval.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="field-group">
          <label>Request type</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => setType('dayOff')}
              className={type === 'dayOff' ? 'btn-primary small' : 'btn-ghost small'} style={{ flex: 1 }}>
              📅 Day off
            </button>
            <button type="button" onClick={() => setType('scheduleChange')}
              className={type === 'scheduleChange' ? 'btn-primary small' : 'btn-ghost small'} style={{ flex: 1 }}>
              🕐 Schedule change
            </button>
          </div>
        </div>

        <div className="field-group">
          <label>Week</label>
          <select value={week} onChange={e => setWeek(e.target.value)} required>
            <option value="">Select a week...</option>
            {WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        </div>

        <div className="field-group">
          <label>{type === 'dayOff' ? 'Day you want off' : 'Day to modify'}</label>
          <select value={day} onChange={e => setDay(e.target.value)} required>
            <option value="">Select a day...</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="field-group">
          <label>{type === 'dayOff' ? 'Reason (optional)' : 'Change details'}</label>
          <input type="text"
            placeholder={type === 'dayOff' ? 'e.g. doctor appointment' : 'e.g. start at 12 instead of 10:30'}
            value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <button type="submit" className="btn-accent" disabled={loading}>
          {loading ? 'Sending...' : '📨 Send request'}
        </button>
      </form>
    </div>
  );
}
