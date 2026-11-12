import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  FileCheck2,
  BarChart3,
  Sliders,
  Shield,
  HeartPulse,
} from 'lucide-react';

export default function Sidebar({ onOpenSettings }) {
  const { currentRole, switchRole, activeTab, setActiveTab, hospitalMetrics } = useApp();

  const getNavItems = () => {
    switch (currentRole) {
      case 'nurse':
        return [
          { id: 'nurse-dashboard', label: 'Nurse Dashboard', icon: LayoutDashboard },
          {
            id: 'nurse-temps',
            label: 'Pending Temperatures',
            icon: Thermometer,
            badge: hospitalMetrics.tempPendingCount,
            badgeColor: hospitalMetrics.tempPendingCount > 0 ? '#b45309' : '#15803d',
            badgeBg: hospitalMetrics.tempPendingCount > 0 ? '#fef3c7' : '#dcfce7',
          },
          { id: 'patients', label: 'All Patients', icon: Users },
        ];
      case 'doctor':
        return [
          { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
          {
            id: 'doctor-ready',
            label: 'Ready for Visit',
            icon: Stethoscope,
            badge: hospitalMetrics.readyForDoctorCount,
            badgeColor: '#1d4ed8',
            badgeBg: '#dbeafe',
          },
          {
            id: 'doctor-reviews',
            label: 'Recovery Reviews',
            icon: FileCheck2,
            badge: hospitalMetrics.eligibleForRecoveryCount,
            badgeColor: '#7e22ce',
            badgeBg: '#f3e8ff',
          },
          { id: 'patients', label: 'All Patients', icon: Users },
        ];
      default: // admin
        return [
          { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Patient Management', icon: Users },
          {
            id: 'discharge-queue',
            label: 'Discharge Queue',
            icon: FileCheck2,
            badge: hospitalMetrics.recommendedForDischargeCount,
            badgeColor: hospitalMetrics.recommendedForDischargeCount > 0 ? '#047857' : '#64748b',
            badgeBg: hospitalMetrics.recommendedForDischargeCount > 0 ? '#d1fae5' : '#f1f5f9',
          },
          { id: 'reports', label: 'Hospital Reports', icon: BarChart3 },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="app-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="logo-badge">
          <HeartPulse size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="logo-text">CareTrack</span>
          <span className="logo-tag">Facility</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-title">
          {currentRole} Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: item.badgeBg,
                    color: item.badgeColor,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '9999px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '16px' }}>
          Facility Overview
        </div>

        {currentRole !== 'admin' && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Facility Reports</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="nav-item"
        >
          <Sliders size={18} />
          <span>Facility Settings</span>
        </button>
      </div>

      {/* Role Quick Switcher Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
          Demo Role Persona
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {['nurse', 'doctor', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => {
                switchRole(role);
                // Also default to that role's primary dashboard
                setActiveTab(role === 'admin' ? 'admin-dashboard' : `${role}-dashboard`);
              }}
              style={{
                padding: '6px 4px',
                border: currentRole === role ? '1px solid var(--primary-600)' : '1px solid var(--border-color)',
                backgroundColor: currentRole === role ? 'var(--primary-50)' : 'white',
                color: currentRole === role ? 'var(--primary-800)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: currentRole === role ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
