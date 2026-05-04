import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

const STEPS = ['Restaurant Info', 'Hours', 'Add Staff', 'Done'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: '700',
            background: i < current ? 'var(--rose)' : i === current ? 'var(--ink)' : 'var(--border)',
            color: i <= current ? '#fff' : 'var(--ink-muted)',
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          <div style={{ fontSize: '0.65rem', color: i === current ? 'var(--ink)' : 'var(--ink-muted)', fontWeight: i === current ? '700' : '400' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RestaurantSetup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0 — Restaurant info
  const [info, setInfo] = useState({ name: '', address: '' });

  // Step 1 — Hours
  const [hours, setHours] = useState({ openTime: '10:30', closeTime: '22:00' });

  // Step 2 — Staff
  const [staffList, setStaffList] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'FOH', contractType: 'full-time', skills: '' });
  const [addingStaff, setAddingStaff] = useState(false);

  // Restaurante creado
  const [restaurant, setRestaurant] = useState(null);

  // ─── STEP 0 → 1: Guardar info del restaurante ───
  const handleSaveInfo = async () => {
    if (!info.name.trim()) return setError('Please enter a restaurant name.');
    setError('');
    setLoading(true);
    try {
      // Actualizar o crear el restaurante
      const { data } = await API.put('/api/restaurants/my', {
        name: info.name,
        address: info.address,
      });
      setRestaurant(data);
      setStep(1);
    } catch (err) {
      // Si no existe aún, crearlo
      try {
        const { data } = await API.post('/api/restaurants/setup', {
          name: info.name,
          address: info.address,
          managerId: user._id,
        });
        setRestaurant(data.restaurant);
        // Actualizar token con el nuevo restaurantId
        await login(data.user, data.token);
        setStep(1);
      } catch (e) {
        setError(e.response?.data?.message || 'Error saving restaurant info.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 1 → 2: Guardar horarios ───
  const handleSaveHours = async () => {
    setError('');
    setLoading(true);
    try {
      await API.put('/api/restaurants/my', {
        openTime: hours.openTime,
        closeTime: hours.closeTime,
      });
      setStep(2);
    } catch (err) {
      setError('Error saving hours.');
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: Agregar staff ───
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email || !newMember.password) {
      return setError('Name, email and password required.');
    }
    setAddingStaff(true);
    setError('');
    try {
      const { data } = await API.post('/api/users', {
        name: newMember.name,
        email: newMember.email,
        password: newMember.password,
        role: newMember.role,
        contractType: newMember.contractType,
        skills: newMember.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setStaffList(prev => [...prev, data.user]);
      setNewMember({ name: '', email: '', password: '', role: 'FOH', contractType: 'full-time', skills: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding member.');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleRemoveMember = (id) => {
    setStaffList(prev => prev.filter(s => s._id !== id));
  };

  const handleFinish = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      <div className="login-card" style={{ maxWidth: '500px' }}>

        {/* Header */}
        <div className="login-brand" style={{ marginBottom: '1.25rem' }}>
          <span className="brand-icon">◈</span>
          <h1>RoosterApp</h1>
          <p>Set up your restaurant</p>
        </div>

        <StepIndicator current={step} />

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* ── STEP 0: Restaurant Info ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="field-group">
              <label>Restaurant name *</label>
              <input type="text" value={info.name}
                onChange={e => setInfo({ ...info, name: e.target.value })}
                placeholder="e.g. Rooster Café" autoFocus />
            </div>
            <div className="field-group">
              <label>Address (optional)</label>
              <input type="text" value={info.address}
                onChange={e => setInfo({ ...info, address: e.target.value })}
                placeholder="e.g. Palermo, Buenos Aires" />
            </div>
            <button className="btn-primary" onClick={handleSaveInfo} disabled={loading}
              style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
              {loading ? 'Saving...' : 'Next →'}
            </button>
          </div>
        )}

        {/* ── STEP 1: Hours ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              What are your opening hours?
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label>Opens at</label>
                <input type="time" value={hours.openTime}
                  onChange={e => setHours({ ...hours, openTime: e.target.value })} />
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <label>Closes at</label>
                <input type="time" value={hours.closeTime}
                  onChange={e => setHours({ ...hours, closeTime: e.target.value })} />
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: 'var(--cream)', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
              🕐 Open <strong style={{ color: 'var(--ink)' }}>{hours.openTime}</strong> — Close <strong style={{ color: 'var(--ink)' }}>{hours.closeTime}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-primary" onClick={handleSaveHours} disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Add Staff ── */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
              Add your team members. You can always add more later.
            </p>

            {/* Staff ya agregado */}
            {staffList.length > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {staffList.map(member => (
                  <div key={member._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#fff', border: '1.5px solid var(--border)',
                    borderRadius: '10px', padding: '0.6rem 0.85rem',
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{member.name}</strong>
                      <span style={{
                        marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.15rem 0.5rem',
                        borderRadius: '20px', fontWeight: '700',
                        background: member.role === 'FOH' ? 'var(--rose)' : 'var(--blush)',
                        color: member.role === 'FOH' ? '#fff' : 'var(--ink-soft)',
                      }}>{member.role}</span>
                      {member.contractType === 'part-time' && (
                        <span style={{ marginLeft: '4px', fontSize: '0.68rem', color: 'var(--ink-muted)' }}>PT</span>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '2px' }}>{member.email}</div>
                    </div>
                    <button onClick={() => handleRemoveMember(member._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-dark)', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario nuevo miembro */}
            <form onSubmit={handleAddMember} style={{
              background: 'var(--cream)', borderRadius: '12px',
              padding: '1rem', border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                + New team member
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Full name"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ flex: 1, minWidth: '130px' }} />
                <input type="email" placeholder="Email"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ flex: 1, minWidth: '130px' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="password" placeholder="Password (min. 6)"
                  value={newMember.password}
                  onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                  minLength={6} style={{ flex: 1, minWidth: '130px' }} />
                <select value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  style={{ flex: 1 }}>
                  <option value="FOH">FOH — Bar / Floor</option>
                  <option value="BOH">BOH — Kitchen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select value={newMember.contractType}
                  onChange={e => setNewMember({ ...newMember, contractType: e.target.value })}
                  style={{ flex: 1 }}>
                  <option value="full-time">Full Time — 40h/week</option>
                  <option value="part-time">Part Time — 20h/week</option>
                </select>
                <input type="text" placeholder="Skills (comma separated)"
                  value={newMember.skills}
                  onChange={e => setNewMember({ ...newMember, skills: e.target.value })}
                  style={{ flex: 1, minWidth: '130px' }} />
              </div>
              <button type="submit" className="btn-accent" disabled={addingStaff}>
                {addingStaff ? 'Adding...' : '+ Add to team'}
              </button>
            </form>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2 }}>
                {staffList.length === 0 ? 'Skip for now →' : `Continue with ${staffList.length} member${staffList.length > 1 ? 's' : ''} →`}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ marginBottom: '0.5rem' }}>{restaurant?.name || 'Your restaurant'} is ready!</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {hours.openTime} – {hours.closeTime}
            </p>
            {staffList.length > 0 && (
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {staffList.length} team member{staffList.length > 1 ? 's' : ''} added
              </p>
            )}
            <button className="btn-accent" onClick={handleFinish}
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
