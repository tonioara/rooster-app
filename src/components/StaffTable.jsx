import { useState } from 'react';
import API from '../api/client';

export default function StaffTable({ staff, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'FOH', skills: '' });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'FOH', skills: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      if (editingId) {
        await API.put(`/api/users/${editingId}`, { name: formData.name, role: formData.role, skills: skillsArray });
      } else {
        await API.post('/api/users', { name: formData.name, email: formData.email, password: formData.password, role: formData.role, skills: skillsArray });
      }
      resetForm();
      if (typeof onRefresh === 'function') onRefresh();
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || 'Error saving.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({ name: member.name, email: member.email || '', password: '', role: member.role, skills: (member.skills || []).join(', ') });
    setEditingId(member._id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} from staff?`)) return;
    try {
      await API.delete(`/api/users/${id}`);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || 'Could not delete.'}`);
    }
  };

  return (
    <div className="staff-section">
      <div className="section-header">
        <h2>Staff</h2>
        <button className="btn-primary small" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm && !editingId ? 'Cancel' : '+ New member'}
        </button>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={handleSubmit} style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Full name"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              required style={{ flex: 1, minWidth: '150px' }} />
            <input type="email" placeholder="Email"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              required={!editingId} disabled={!!editingId}
              style={{ flex: 1, minWidth: '150px', opacity: editingId ? 0.6 : 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!editingId && (
              <input type="password" placeholder="Password (min. 6 characters)"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                required minLength={6} style={{ flex: 1, minWidth: '200px' }} />
            )}
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ flex: 1 }}>
              <option value="FOH">FOH — Front of house / Bar</option>
              <option value="BOH">BOH — Kitchen</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <input type="text" placeholder="Skills: bar, kitchen, service..."
            value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : editingId ? '💾 Save changes' : 'Create'}
            </button>
            <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Skills</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!staff || staff.length === 0) && (
              <tr><td colSpan={5} className="empty-row">No staff members registered</td></tr>
            )}
            {staff && staff.map(member => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{member.email || '—'}</td>
                <td><span className={`badge ${member.role === 'admin' ? 'admin' : member.role === 'FOH' ? 'manager' : 'employee'}`}>{member.role}</span></td>
                <td>{(member.skills || []).join(', ') || '—'}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-ghost small" onClick={() => handleEdit(member)}>✏️</button>
                  <button className="btn-danger small" onClick={() => handleDelete(member._id, member.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="staff-card-list">
        {(!staff || staff.length === 0) && (
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '1.5rem' }}>No staff members registered</p>
        )}
        {staff && staff.map(member => (
          <div key={member._id} className="staff-card">
            <div className="staff-card-info">
              <div className="staff-card-name">{member.name}</div>
              <div className="staff-card-email">{member.email || '—'}</div>
              <span className={`badge ${member.role === 'admin' ? 'admin' : member.role === 'FOH' ? 'manager' : 'employee'}`}>{member.role}</span>
              {member.skills?.length > 0 && <div className="staff-card-skills" style={{ marginTop: '0.4rem' }}>{member.skills.join(', ')}</div>}
            </div>
            <div className="staff-card-actions">
              <button className="btn-ghost small" onClick={() => handleEdit(member)}>✏️</button>
              <button className="btn-danger small" onClick={() => handleDelete(member._id, member.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
