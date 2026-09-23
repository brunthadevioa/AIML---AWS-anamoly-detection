import React from 'react';

export default function RadialGauge({ 
  value = 0, 
  min = 0, 
  max = 100, 
  unit = '', 
  label = '', 
  color = '#0284c7',
  icon: Icon,
  isAbnormal = false,
  statusText = 'Normal'
}) {
  const radius = 42;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const clampedVal = Math.min(Math.max(value, min), max);
  const percentage = (clampedVal - min) / (max - min);
  const strokeDashoffset = circumference - percentage * circumference * 0.75; // 270 degree arc

  return (
    <div className="glass-card" style={{
      textAlign: 'center',
      padding: '1.25rem 1rem',
      background: '#ffffff',
      borderLeft: isAbnormal ? '4px solid var(--crimson-primary)' : '1px solid #e2e8f0',
      boxShadow: isAbnormal ? '0 4px 16px rgba(239, 68, 68, 0.15)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
      position: 'relative'
    }}>
      {/* Top Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
          {Icon && <Icon size={16} color={color} />} {label}
        </span>
        <span className={`badge ${isAbnormal ? 'badge-critical' : 'badge-healthy'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
          {isAbnormal ? '⚠️ Breached' : '✓ Normal'}
        </span>
      </div>

      {/* SVG Radial Arc */}
      <div style={{ position: 'relative', width: '110px', height: '90px', margin: '0.25rem auto' }}>
        <svg height="100%" width="100%" viewBox="0 0 100 80" style={{ transform: 'rotate(-135deg)', transformOrigin: '50% 50%' }}>
          {/* Background Track */}
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            r={normalizedRadius}
            cx="50"
            cy="50"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease'
            }}
            r={normalizedRadius}
            cx="50"
            cy="50"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Display */}
        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div className="mono" style={{ fontSize: '1.35rem', fontWeight: '900', color: isAbnormal ? 'var(--crimson-primary)' : 'var(--text-primary)', lineHeight: 1 }}>
            {value.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '600' }}>
            {unit}
          </div>
        </div>
      </div>

      {/* Min/Max baseline bounds */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
