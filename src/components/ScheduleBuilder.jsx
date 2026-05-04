import { useState } from 'react';
import API from '../api/client';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_TYPE = {
  Monday:    { label: '🟢 Quiet',  color: '#f0faf4' },
  Tuesday:   { label: '🟢 Quiet',  color: '#f0faf4' },
  Wednesday: { label: '🟡 Medium', color: '#fffbf0' },
  Thursday:  { label: '🟡 Medium', color: '#fffbf0' },
  Friday:    { label: '🔴 Busy',   color: '#fff5f5' },
  Saturday:  { label: '🔴 Busy',   color: '#fff5f5' },
};

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return Math.round(Math.max(0, diff) / 60 * 10) / 10;
}

function ShiftCard({ shift, idx, day, onUpdate, onUpdateSplit }) {
  const totalHours = shift.isSplit
    ? calcHours(shift.startTime, shift.endTime) + calcHours(shift.splitReturn || '', shift.splitEnd || '')
    : shift.hoursWorked;

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', padding: '0.85rem',
      marginBottom: '0.5rem', border: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ fontSize: '0.9rem' }}>{shift.employeeName}</strong>
          <span style={{
            fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '20px',
            background: shift.role === 'FOH' ? 'var(--rose)' : 'var(--blush)',
            color: shift.role === 'FOH' ? '#fff' : 'var(--ink-soft)', fontWeight: '700',
          }}>{shift.role}</span>
          {shift.contractType === 'part-time' && (
            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#f0f0f0', color: '#666', fontWeight: '700' }}>PT</span>
          )}
          {shift.isSplit && (
            <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#e8f4ff', color: '#1565c0', fontWeight: '700' }}>Split</span>
          )}
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--ink)' }}>
          {totalHours.toFixed(1)}h total
        </span>
      </div>

      {/* Turno principal */}
      <div style={{ background: 'var(--cream)', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: shift.isSplit ? '0.4rem' : '0' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
          {shift.isSplit ? '☀️ Lunch shift' : '⏰ Shift'}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: '600' }}>From</label>
            <input type="time" value={shift.startTime}
              onChange={e => onUpdate(idx, 'startTime', e.target.value)}
              style={{ padding: '0.3rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: '600' }}>To</label>
            <input type="time" value={shift.endTime}
              onChange={e => onUpdate(idx, 'endTime', e.target.value)}
              style={{ padding: '0.3rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            {calcHours(shift.startTime, shift.endTime)}h
          </span>
        </div>
      </div>

      {/* Split shift — turno de vuelta */}
      {shift.isSplit && (
        <div style={{ background: '#e8f4ff', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1565c0', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            🌙 Dinner shift (back)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#1565c0', fontWeight: '600' }}>From</label>
              <input type="time" value={shift.splitReturn || '17:30'}
                onChange={e => onUpdateSplit(idx, 'splitReturn', e.target.value)}
                style={{ padding: '0.3rem 0.5rem', border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#1565c0', fontWeight: '600' }}>To</label>
              <input type="time" value={shift.splitEnd || '22:00'}
                onChange={e => onUpdateSplit(idx, 'splitEnd', e.target.value)}
                style={{ padding: '0.3rem 0.5rem', border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit' }}
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#1565c0' }}>
              {calcHours(shift.splitReturn || '17:30', shift.splitEnd || '22:00')}h
            </span>
          </div>
        </div>
      )}

      {/* Nota */}
      <input type="text" value={shift.note || ''}
        onChange={e => onUpdate(idx, 'note', e.target.value)}
        placeholder="Note (optional)"
        style={{ width: '100%', padding: '0.3rem 0.6rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', marginTop: '0.4rem', fontFamily: 'inherit', background: 'transparent' }}
      />
    </div>
  );
}

export default function ScheduleBuilder({ staff, weekId, onConfirmed }) {
  const fohStaff = staff.filter(s => s.role === 'FOH');
  const bohStaff = staff.filter(s => s.role === 'BOH');

  const [step, setStep] = useState(1);
  const [dailyStaff, setDailyStaff] = useState({});
  const [editedShifts, setEditedShifts] = useState({});
  const [weeklyHours, setWeeklyHours] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const toggleStaff = (day, empId) => {
    setDailyStaff(prev => {
      const current = prev[day] || [];
      const updated = current.includes(empId)
        ? current.filter(id => id !== empId)
        : [...current, empId];
      return { ...prev, [day]: updated };
    });
  };

  const isWorking = (day, empId) => (dailyStaff[day] || []).includes(empId);

  const handleGetSuggestions = async () => {
    const activeDays = Object.entries(dailyStaff).filter(([, ids]) => ids.length > 0);
    if (activeDays.length === 0) return alert('⚠️ Select staff for at least one day.');
    setLoading(true);
    try {
      const { data } = await API.post('/api/schedule/suggest', { weekId, dailyStaff });
      setWeeklyHours(data.weeklyHours || []);
      setWarnings(data.warnings || []);
      const edited = {};
      Object.entries(data.suggestions).forEach(([day, roles]) => {
        edited[day] = [
          ...(roles.FOH || []).map(s => ({ ...s, day })),
          ...(roles.BOH || []).map(s => ({ ...s, day })),
        ];
      });
      setEditedShifts(edited);
      setStep(2);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Error getting suggestions.'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateShift = (day, idx, field, value) => {
    setEditedShifts(prev => {
      const updated = { ...prev };
      const dayShifts = [...(updated[day] || [])];
      dayShifts[idx] = { ...dayShifts[idx], [field]: value };
      if (field === 'startTime' || field === 'endTime') {
        dayShifts[idx].hoursWorked = calcHours(dayShifts[idx].startTime, dayShifts[idx].endTime);
      }
      updated[day] = dayShifts;
      return updated;
    });
  };

  const updateSplit = (day, idx, field, value) => {
    setEditedShifts(prev => {
      const updated = { ...prev };
      const dayShifts = [...(updated[day] || [])];
      dayShifts[idx] = { ...dayShifts[idx], [field]: value };
      if (field === 'splitReturn' || field === 'splitEnd') {
        dayShifts[idx].splitHours = calcHours(
          dayShifts[idx].splitReturn || '17:30',
          dayShifts[idx].splitEnd || '22:00'
        );
      }
      updated[day] = dayShifts;
      return updated;
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const confirmedShifts = Object.values(editedShifts).flat();
      const { data } = await API.post('/api/schedule/confirm', { weekId, confirmedShifts });
      if (typeof onConfirmed === 'function') onConfirmed(data);
      setStep(3);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Error confirming.'}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2>Schedule Builder</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
          Select who works → review suggested times → adjust → confirm
        </p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {['1. Who works?','2. Review & edit','3. Done'].map((label, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '0.5rem 0.25rem',
            borderRadius: '8px', fontSize: '0.72rem', fontWeight: '600',
            background: step === i+1 ? 'var(--ink)' : step > i+1 ? 'var(--rose)' : 'var(--border)',
            color: step >= i+1 ? '#fff' : 'var(--ink-muted)',
          }}>{label}</div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          {DAYS.map(day => {
            const working = dailyStaff[day] || [];
            const dt = DAY_TYPE[day];
            return (
              <div key={day} style={{ marginBottom: '0.75rem', padding: '1rem', background: dt.color, borderRadius: '12px', border: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{day}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                    {dt.label} · {working.length} staff
                  </span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>FOH</div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {fohStaff.map(emp => {
                      const sel = isWorking(day, emp._id);
                      return (
                        <button key={emp._id} type="button" onClick={() => toggleStaff(day, emp._id)}
                          style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', transition: 'all 0.15s', borderColor: sel ? 'var(--ink)' : 'var(--border)', background: sel ? 'var(--ink)' : '#fff', color: sel ? 'var(--cream)' : 'var(--ink-muted)' }}>
                          {emp.name}{emp.contractType === 'part-time' && <span style={{ fontSize: '0.65rem', marginLeft: '4px', opacity: 0.7 }}>PT</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>BOH</div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {bohStaff.map(emp => {
                      const sel = isWorking(day, emp._id);
                      return (
                        <button key={emp._id} type="button" onClick={() => toggleStaff(day, emp._id)}
                          style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', transition: 'all 0.15s', borderColor: sel ? 'var(--rose)' : 'var(--border)', background: sel ? 'var(--rose)' : '#fff', color: sel ? '#fff' : 'var(--ink-muted)' }}>
                          {emp.name}{emp.contractType === 'part-time' && <span style={{ fontSize: '0.65rem', marginLeft: '4px', opacity: 0.7 }}>PT</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <button className="btn-accent" onClick={handleGetSuggestions} disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            {loading ? 'Generating...' : '⚡ Get schedule suggestions'}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          {warnings.length > 0 && (
            <div style={{ background: '#fff8e1', border: '1.5px solid #ffe082', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#b8860b' }}>⚠️ Hours warnings</strong>
              {warnings.map(w => (
                <div key={w.employeeId} style={{ fontSize: '0.8rem', color: '#b8860b', marginTop: '0.3rem' }}>
                  {w.employeeName} — {w.totalHours}h / {w.maxHours}h ({w.contractType})
                </div>
              ))}
            </div>
          )}

          {Object.entries(editedShifts).map(([day, shifts]) => (
            <div key={day} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{day}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{shifts.length} shifts</span>
              </div>
              {shifts.map((shift, idx) => (
                <ShiftCard key={idx} shift={shift} idx={idx} day={day}
                  onUpdate={(i, f, v) => updateShift(day, i, f, v)}
                  onUpdateSplit={(i, f, v) => updateSplit(day, i, f, v)}
                />
              ))}
            </div>
          ))}

          {/* Weekly hours summary */}
          {weeklyHours.length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.75rem' }}>Weekly hours</strong>
              {weeklyHours.map(emp => (
                <div key={emp.employeeId} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    <span>{emp.employeeName} <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>({emp.contractType === 'part-time' ? 'PT' : 'FT'})</span></span>
                    <span style={{ fontWeight: '700', color: emp.overLimit ? '#c0392b' : emp.nearLimit ? '#b8860b' : '#2e7d32' }}>
                      {emp.totalHours}h / {emp.maxHours}h {emp.overLimit ? '⚠️' : ''}
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: emp.overLimit ? '#c0392b' : emp.nearLimit ? '#b8860b' : '#2e7d32', width: `${Math.min((emp.totalHours / emp.maxHours) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
            <button className="btn-accent" onClick={handleConfirm} disabled={confirming} style={{ flex: 2 }}>
              {confirming ? 'Saving...' : '✅ Confirm schedule'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Schedule saved!</h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Roster for {weekId} confirmed.
          </p>
          <button className="btn-primary" onClick={() => { setStep(1); setDailyStaff({}); }}>
            Build another week
          </button>
        </div>
      )}
    </div>
  );
}
