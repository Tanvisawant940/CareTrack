import React from 'react';

export default function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
  badge,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          iconBg: 'var(--primary-50)',
          iconColor: 'var(--primary-700)',
          borderColor: 'var(--border-color)',
        };
      case 'success':
        return {
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          borderColor: 'var(--border-color)',
        };
      case 'warning':
        return {
          iconBg: '#fffbeb',
          iconColor: '#d97706',
          borderColor: '#fde68a',
        };
      case 'danger':
        return {
          iconBg: '#fef2f2',
          iconColor: '#dc2626',
          borderColor: '#fca5a5',
        };
      case 'info':
        return {
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          borderColor: 'var(--border-color)',
        };
      case 'purple':
        return {
          iconBg: '#faf5ff',
          iconColor: '#7c3aed',
          borderColor: 'var(--border-color)',
        };
      default:
        return {
          iconBg: 'var(--bg-surface-subtle)',
          iconColor: 'var(--text-muted)',
          borderColor: 'var(--border-color)',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderColor: styles.borderColor,
      }}
    >
      <div className="stat-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="stat-label">{label}</span>
          {badge && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: badge.bg || '#f1f5f9',
                color: badge.color || '#475569',
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>

      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: styles.iconBg,
            color: styles.iconColor,
          }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
