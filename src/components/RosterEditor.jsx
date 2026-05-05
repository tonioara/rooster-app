import { useState } from 'react';
import { toast } from 'sonner';
import API from '../api/client';

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.round(Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function RosterEditor({ roster, weekId, onSaved }) {
  const [shifts, setShifts] = useState(() => {
    if (!roster?.shifts) return [];
    return roster.shifts.map(s => ({
      _id: s._id,
      day: s.day,
      role: s.role,
      employeeName: s.employee?.name || 'Unknown',
      employeeId: s.employee?._id || s.employee,
      startTime: s.startTime || '10:30',
      endTime: s.endTime || '22:00',
      hoursWorked: s.hoursWorked || 0,
      notes: s.notes || '',
    }));
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const updateShift = (idx, field, value) => {
    setShifts(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'startTime' || field === 'endTime') {
        updated[idx].hoursWorked = calcHours(updated[idx].startTime, updated[idx].endTime);
      }
      return updated;
    });
  };

  const removeShift = (idx) => {
    if (!window.confirm('Remove this shift?')) return;
    setShifts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/api/roster/', {
        weekId,
        shifts: shifts.map(s => ({
          day: s.day,
          role: s.role,
          employee: s.employeeId,
          startTime: s.startTime,
          endTime: s.endTime,
          shiftType: s.startTime < '14:00' ? 'Mañana' : 'Tarde',
          hoursWorked: s.hoursWorked,
          notes: s.notes,
        })),
      });
      toast.success('✅ Roster saved', { description: `Week ${weekId} updated successfully` });
      if (typeof onSaved === 'function') onSaved();
    } catch {
      toast.error('❌ Error saving roster');
    } finally {
      setSaving(false);
    }
  };

  const filteredShifts = filter === 'All'
    ? shifts
    : shifts.filter(s => s.day === filter);

  const byDay = {};
  filteredShifts.forEach(shift => {
    if (!byDay[shift.day]) byDay[shift.day] = [];
    byDay[shift.day].push({ ...shift, originalIdx: shifts.findIndex(s => s === shift || s._id === shift._id) });
  });

  const totalHours = shifts.reduce((sum, s) => sum + (s.hoursWorked || 0), 0);

  return (
    <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2>Edit Roster</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
            Week {weekId} — {shifts.length} shifts — {totalHours.toFixed(1)}h total
          </p>
        </div>
        <button className="btn-accent" onClick={handleSave} disabled={saving}
          style={{ padding: '0.6rem 1.25rem' }}>
          {saving ? 'Saving...' : '💾 Save changes'}
        </button>
      </div>

      {/* Filtro por día */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['All', ...DAYS].map(day => (
          <button key={day} onClick={() => setFilter(day)}
            className={filter === day ? 'btn-primary small' : 'btn-ghost small'}>
            {day === 'All' ? 'All' : day.slice(0, 3)}
          </button>
        ))}
      </div>

      {Object.entries(byDay).map(([day, dayShifts]) => (
        <div key={day} style={{ marginBottom: '1.25rem' }}>
          <div style={{
            fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase',
            color: 'var(--ink-muted)', letterSpacing: '0.06em',
            marginBottom: '0.5rem', paddingBottom: '0.4rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{day}</span>
            <span>{dayShifts.length} shifts</span>
          </div>
          {dayShifts.map((shift) => (
            <div key={shift._id || shift.originalIdx} style={{
              background: '#fff', border: '1.5px solid var(--border)',
              borderRadius: '10px', padding: '0.75rem',
              marginBottom: '0.5rem', display: 'flex',
              gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: '110px' }}>
                <strong style={{ fontSize: '0.88rem' }}>{shift.employeeName}</strong>
                <span style={{
                  marginLeft: '0.4rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                  borderRadius: '20px', fontWeight: '700',
                  background: shift.role === 'FOH' ? 'var(--rose)' : 'var(--blush)',
                  color: shift.role === 'FOH' ? '#fff' : 'var(--ink-soft)',
                }}>{shift.role}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                <input type="time" value={shift.startTime}
                  onChange={e => updateShift(shift.originalIdx, 'startTime', e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }} />
                <span style={{ color: 'var(--ink-muted)' }}>→</span>
                <input type="time" value={shift.endTime}
                  onChange={e => updateShift(shift.originalIdx, 'endTime', e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', minWidth: '32px' }}>
                  {shift.hoursWorked}h
                </span>
              </div>

              <input type="text" value={shift.notes}
                onChange={e => updateShift(shift.originalIdx, 'notes', e.target.value)}
                placeholder="Note..."
                style={{ flex: 1, minWidth: '100px', padding: '0.3rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'inherit' }} />

              <button onClick={() => removeShift(shift.originalIdx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '1rem', padding: '0.2rem', flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      ))}

      {shifts.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '2rem' }}>
          No shifts to edit. Generate a roster first using ⚡ Build.
        </div>
      )}
    </div>
  );
}
