import React from 'react';
import { ShieldCheck, AlertOctagon, GitCompare, Radio, Server } from 'lucide-react';

export default function ComparativeRadar({ diagnosticData }) {
  if (!diagnosticData) return null;

  const {
    station = { id: 'AWS_ERD_003', name: 'Bhavani' },
    observation = { temperature: 48.4, humidity: 61.2, pressure: 1005.4 },
    context = { era5_reference: 29.5, era5_deviation: 18.9, neighbour_mean: 28.6, neighbour_agreement: false, cross_parameter_consistency: false },
    classification = { label: 'POSSIBLE_SENSOR_FAULT', confidence: 0.916 }
  } = diagnosticData;

  const isFault = classification.label === 'POSSIBLE_SENSOR_FAULT';

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitCompare size={20} color="var(--blue-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Multi-Source Atmospheric Consensus Matrix
          </h3>
        </div>
        <span className="badge badge-cyan">ERA5 Ground-Truth Cross-Check</span>
      </div>

      {/* 3 Source Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        
        {/* 1. Physical AWS Telemetry */}
        <div className="glass-card" style={{ borderLeft: isFault ? '4px solid var(--crimson-primary)' : '4px solid var(--green-primary)', padding: '1rem', background: '#ffffff' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700' }}>
            Physical Sensor On-Site
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {station.name} AWS
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: '900', color: isFault ? 'var(--crimson-primary)' : 'var(--green-primary)', marginTop: '0.5rem' }}>
            {observation.temperature.toFixed(1)}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: isFault ? 'var(--crimson-primary)' : 'var(--green-primary)', marginTop: '0.25rem', fontWeight: '600' }}>
            {isFault ? '🔴 Extreme Outlier' : '🟢 Normal Flow'}
          </div>
        </div>

        {/* 2. ERA5 Reanalysis Baseline */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--blue-primary)', padding: '1rem', background: '#ffffff' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700' }}>
            Atmospheric Reanalysis
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            ERA5 Open-Meteo
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--blue-primary)', marginTop: '0.5rem' }}>
            {context.era5_reference.toFixed(1)}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Deviation: <strong style={{ color: isFault ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>{context.era5_deviation > 0 ? `+${context.era5_deviation.toFixed(1)}°C` : `${context.era5_deviation.toFixed(1)}°C`}</strong>
          </div>
        </div>

        {/* 3. 4 Neighbouring AWS Stations Consensus */}
        <div className="glass-card" style={{ borderLeft: '4px solid #6366f1', padding: '1rem', background: '#ffffff' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700' }}>
            Spatial Consensus (4 Stations)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            Erode Grid Mean
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: '900', color: '#6366f1', marginTop: '0.5rem' }}>
            {context.neighbour_mean.toFixed(1)}°C
          </div>
          <div style={{ fontSize: '0.75rem', color: context.neighbour_agreement ? 'var(--green-primary)' : 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600' }}>
            {context.neighbour_agreement ? '✓ Stations Agree (Weather Event)' : '✗ Isolated Reading (Sensor Fault)'}
          </div>
        </div>

      </div>

      {/* Visual Consensus Slider */}
      <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Spatial Agreement Disparity Index</span>
          <span style={{ color: isFault ? 'var(--crimson-primary)' : 'var(--green-primary)', fontWeight: '800' }}>
            {isFault ? 'Discrepancy Breached (18.9°C Gap)' : 'Consensus Synchronized (< 2°C Gap)'}
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{
            width: isFault ? '88%' : '14%',
            height: '100%',
            background: isFault ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #0284c7, #10b981)',
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

    </div>
  );
}
