import React from 'react';

const SHIFT_TIMES = {
  FOH: {
    Mañana: { start: '10:30', end: '4:00' },
    Tarde:  { start: '4:00',  end: '10:00' },
  },
  BOH: {
    Mañana: { start: '9:00',  end: '3:30' },
    Tarde:  { start: '5:00',  end: '9:00' },
  },
};

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function getDayOff(shifts, day) {
  const allEmployees = new Set();
  shifts.forEach(s => {
    const name = s.employee?.name || s.employee;
    if (name) allEmployees.add(name);
  });
  const workingToday = new Set(
    shifts.filter(s => s.day === day).map(s => s.employee?.name || s.employee)
  );
  return [...allEmployees].filter(e => !workingToday.has(e));
}

function getShiftTime(role, shiftType) {
  return SHIFT_TIMES[role]?.[shiftType] || { start: '—', end: '—' };
}

function thStyle(bg, width) {
  return {
    backgroundColor: bg, color: '#fff', padding: '10px 14px',
    textAlign: 'left', fontWeight: '700', fontSize: '0.78rem',
    letterSpacing: '0.05em', textTransform: 'uppercase', width,
    borderRight: '1px solid rgba(255,255,255,0.1)',
  };
}

const tdStyle = { padding: '10px 14px', verticalAlign: 'top', borderRight: '1px solid #ccc', color: '#333' };

function shiftRowStyle(idx, total) {
  return {
    paddingBottom: idx < total - 1 ? '6px' : '0',
    marginBottom: idx < total - 1 ? '6px' : '0',
    borderBottom: idx < total - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
  };
}

export default function RosterTable({ rosterData, weekId, dateViewed }) {
  if (!rosterData || rosterData.length === 0) {
    return (
      <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--ink-muted)', padding: '2rem' }}>
        <p>No hay turnos para la semana: <strong>{weekId || '—'}</strong></p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Generá el roster primero con ⚡ Generar</p>
      </div>
    );
  }

  const byDay = {};
  rosterData.forEach(shift => {
    const day = shift.day || 'Sin día';
    if (!byDay[day]) byDay[day] = { Mañana: [], Tarde: [] };
    const type = shift.shiftType === 'Mañana' ? 'Mañana' : 'Tarde';
    byDay[day][type].push(shift);
  });

  const sortedDays = DAYS_ORDER.filter(d => byDay[d]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {weekId && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Semana: <strong>{weekId}</strong></span>
          {dateViewed && <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{dateViewed}</span>}
        </div>
      )}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1.5px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>
          <thead>
            <tr>
              <th style={thStyle('#2d2d2d', '15%')}>Día</th>
              <th style={thStyle('#4a4a4a', '42%')}>🌅 Lunch</th>
              <th style={thStyle('#2d2d2d', '43%')}>🌙 Dinner</th>
            </tr>
          </thead>
          <tbody>
            {sortedDays.map((day, i) => {
              const dayShifts = byDay[day];
              const offPeople = getDayOff(rosterData, day);
              const isEven = i % 2 === 0;
              return (
                <tr key={day} style={{ backgroundColor: isEven ? '#f5f5f5' : '#e8e8e8' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1a1a1a', borderRight: '1px solid #ccc', verticalAlign: 'top' }}>
                    <div>{day}</div>
                    {offPeople.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: '400', marginTop: '2px' }}>
                        {offPeople.join(', ')} Off
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {dayShifts.Mañana.length === 0 ? <span style={{ color: '#aaa' }}>—</span>
                      : dayShifts.Mañana.map((shift, idx) => {
                          const name = shift.employee?.name || shift.employee || 'Empleado';
                          const role = shift.role || 'FOH';
                          const times = getShiftTime(role, 'Mañana');
                          return (
                            <div key={idx} style={shiftRowStyle(idx, dayShifts.Mañana.length)}>
                              <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{name}:</span>
                              <span style={{ color: '#555', marginLeft: '4px' }}>{times.start}–{times.end}</span>
                            </div>
                          );
                        })
                    }
                  </td>
                  <td style={tdStyle}>
                    {dayShifts.Tarde.length === 0 ? <span style={{ color: '#aaa' }}>—</span>
                      : dayShifts.Tarde.map((shift, idx) => {
                          const name = shift.employee?.name || shift.employee || 'Empleado';
                          const role = shift.role || 'FOH';
                          const times = getShiftTime(role, 'Tarde');
                          return (
                            <div key={idx} style={shiftRowStyle(idx, dayShifts.Tarde.length)}>
                              <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{name}:</span>
                              <span style={{ color: '#555', marginLeft: '4px' }}>{times.start}–{times.end}</span>
                            </div>
                          );
                        })
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
