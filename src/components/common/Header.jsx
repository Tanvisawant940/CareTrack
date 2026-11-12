import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatReadableDate } from '../../utils/dateUtils';
import {
  Calendar,
  FastForward,
  RotateCcw,
  Sliders,
  LogOut,
  BedDouble,
  Thermometer,
  ShieldAlert,
  User,
  ChevronDown,
} from 'lucide-react';

export default function Header({ onOpenSettings }) {
  const {
    currentRole,
    switchRole,
    logout,
    currentDate,
    advanceDay,
    resetSimulationDate,
    simulatedOffset,
    feverThreshold,
    hospitalMetrics,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'nurse':
        return 'role-nurse';
      case 'doctor':
        return 'role-doctor';
      default:
        return 'role-admin';
    }
  };

  return (
    <header className="app-header">
      {/* Left side info */}
      <div className="header-left">
        {/* Capacity Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: hospitalMetrics.occupiedRooms >= 70 ? '#fef2f2' : '#f0fdf4',
            color: hospitalMetrics.occupiedRooms >= 70 ? '#991b1b' : '#166534',
            border: `1px solid ${hospitalMetrics.occupiedRooms >= 70 ? '#fecaca' : '#bbf7d0'}`,
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
          title={`Hospital Capacity: ${hospitalMetrics.occupiedRooms} occupied out of ${hospitalMetrics.maxCapacity} max capacity`}
        >
          <BedDouble size={15} />
          <span>Capacity: <strong>{hospitalMetrics.occupiedRooms}</strong> / {hospitalMetrics.maxCapacity}</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({hospitalMetrics.availableRooms} free)</span>
        </div>

        {/* Configurable Fever Threshold */}
        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Fever threshold is configurable per facility policy. Click to configure."
        >
          <Thermometer size={14} />
          <span>Fever Threshold: <strong>≥ {feverThreshold}°C</strong></span>
          <Sliders size={12} style={{ opacity: 0.7 }} />
        </button>

        {/* Simulated Date Controller */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '9999px',
            padding: '3px 8px 3px 12px',
            fontSize: '0.8rem',
          }}
        >
          <Calendar size={14} style={{ color: '#475569' }} />
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {formatReadableDate(currentDate)}
          </span>
          {simulatedOffset !== 0 && (
            <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>
              (+{simulatedOffset}d)
            </span>
          )}

          {/* Advance Day button for evaluator testing */}
          <button
            onClick={() => advanceDay(1)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              borderRadius: '9999px',
              height: '24px',
              marginLeft: '4px',
            }}
            title="Advance simulation by 1 day to test next-day workflow"
          >
            <FastForward size={12} />
            +1 Day
          </button>

          {simulatedOffset !== 0 && (
            <button
              onClick={resetSimulationDate}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Reset simulation date to actual calendar today"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="header-right">
        {/* Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <span className={`role-badge ${getRoleBadgeClass(currentRole)}`}>
              <User size={12} />
              {currentRole}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Switch Role
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                width: '180px',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Persona
              </div>
              {['nurse', 'doctor', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setRoleDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '9px 14px',
                    border: 'none',
                    background: currentRole === role ? 'var(--primary-50)' : 'transparent',
                    color: currentRole === role ? 'var(--primary-800)' : 'var(--text-main)',
                    fontWeight: currentRole === role ? 700 : 500,
                    fontSize: '0.84rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span className={`role-badge ${getRoleBadgeClass(role)}`} style={{ padding: '2px 6px' }}>
                    {role.slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{ textTransform: 'capitalize' }}>{role}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Facility Settings Button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary btn-icon"
          title="Facility Settings & Demo Controls"
          style={{ width: '36px', height: '36px' }}
        >
          <Sliders size={16} />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary btn-icon"
          title="Sign Out"
          style={{ width: '36px', height: '36px', color: '#64748b' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
