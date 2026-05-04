import React from 'react';

export default function HoursPanel({ hoursPerEmployee }) {
  if (!hoursPerEmployee || hoursPerEmployee.length === 0) return null;

  const foh = hoursPerEmployee.filter(e => e.shifts?.[0]?.role === 'FOH');
  const boh = hoursPerEmployee.filter(e => e.shifts?.[0]?.role === 'BOH');

  const renderGroup = (group, label) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
        {label}
      </h3>
      {group.map(emp => (
        <div key={emp.employeeId} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <strong style={{ fontSize: '0.95rem' }}>{emp.employeeName}</strong>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                Max: <strong>{emp.maxHours}h</strong>
              </span>
              <span style={{ fontSize: '0.78rem', background: emp.overLimit ? '#fde8e8' : 'var(--ink)', color: emp.overLimit ? '#c0392b' : 'var(--cream)', borderRadius: '20px', padding: '0.15rem 0.6rem', fontWeight: '700' }}>
                {emp.totalHours}h {emp.overLimit ? '⚠️' : ''}
              </span>
            </div>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', background: emp.overLimit ? '#c0392b' : emp.nearLimit ? '#b8860b' : '#2e7d32', width: `${Math.min((emp.totalHours / emp.maxHours) * 100, 100)}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1.25rem', marginTop: '1rem' }}>
      <h2 style={{ marginBottom: '0.25rem' }}>Hours Summary</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>Weekly hours per employee</p>
      {foh.length > 0 && renderGroup(foh, 'FOH — Front of House')}
      {boh.length > 0 && renderGroup(boh, 'BOH — Kitchen')}
    </div>
  );
}
