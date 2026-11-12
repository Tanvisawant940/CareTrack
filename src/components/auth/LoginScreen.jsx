import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartPulse,
  User,
  Stethoscope,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function LoginScreen() {
  const { login } = useApp();

  const [email, setEmail] = useState('admin@caretrack.health');
  const [password, setPassword] = useState('caretrack2026');
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleManualLogin = (e) => {
    e.preventDefault();
    login(selectedRole);
  };

  const handleQuickDemoLogin = (role) => {
    login(role);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div
            className="logo-badge"
            style={{ width: '48px', height: '48px', margin: '0 auto 12px' }}
          >
            <HeartPulse size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-900)', letterSpacing: '-0.02em' }}>
            CareTrack
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Patient Monitoring & Quarantine Facility Management
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-800)',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              marginTop: '10px',
            }}
          >
            <CheckCircle2 size={13} />
            74-Bed Capacity Management System
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleManualLogin}>
          <div className="form-group">
            <label className="form-label">Hospital Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.org"
                required
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role Persona</label>
            <select
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="admin">Administrator (Sarah Connor)</option>
              <option value="doctor">Attending Physician (Dr. Marcus Wells)</option>
              <option value="nurse">Duty Nurse (Clara Vance)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: '4px' }}
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Demo Access Section */}
        <div className="login-demo-roles">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Instant Evaluation Demo Access
          </div>

          {/* Nurse Button */}
          <button
            type="button"
            className="role-demo-btn"
            onClick={() => handleQuickDemoLogin('nurse')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Enter as Nurse</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily temperature logging & vital alerts</div>
              </div>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Doctor Button */}
          <button
            type="button"
            className="role-demo-btn"
            onClick={() => handleQuickDemoLogin('doctor')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={15} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Enter as Doctor</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily clinical rounds & discharge reviews</div>
              </div>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Admin Button */}
          <button
            type="button"
            className="role-demo-btn"
            onClick={() => handleQuickDemoLogin('admin')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={15} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Enter as Admin</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Capacity, discharge authorizations & reports</div>
              </div>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
