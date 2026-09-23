import React from 'react';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  Radio, 
  Activity,
  Droplets,
  Thermometer
} from 'lucide-react';

export default function StationGrid({ stations, selectedStation, onSelectStation, activeAnomalies = {} }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      
      {/* Station Selector Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} color="var(--blue-primary)" className="pulse-active" /> Erode District 5-Station AWS Array (Click to inspect)
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Spatial Network: <strong style={{ color: 'var(--green-primary)' }}>5/5 Online</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {stations.map((st) => {
          const isSelected = selectedStation?.station_id === st.station_id;
          const anomaly = activeAnomalies[st.station_id];
          const hasFault = anomaly?.classification?.label === 'POSSIBLE_SENSOR_FAULT';
          const isWeather = anomaly?.classification?.label === 'REAL_WEATHER_EVENT';
          
          const temp = anomaly?.observation?.temperature ?? st.temperature ?? 31.0;
          const humidity = anomaly?.observation?.humidity ?? st.humidity ?? 64;

          return (
            <div
              key={st.station_id}
              onClick={() => onSelectStation(st)}
              className="glass-card"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                borderRadius: '16px',
                border: isSelected 
                  ? (hasFault ? '2px solid var(--crimson-primary)' : '2px solid var(--blue-primary)') 
                  : (hasFault ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(226, 232, 240, 0.9)'),
                background: isSelected 
                  ? (hasFault ? 'var(--crimson-light)' : 'var(--blue-light)') 
                  : (hasFault ? '#fff5f5' : '#ffffff'),
                boxShadow: isSelected 
                  ? (hasFault ? '0 4px 16px rgba(239, 68, 68, 0.2)' : '0 4px 16px rgba(2, 132, 199, 0.2)') 
                  : '0 2px 8px rgba(15, 23, 42, 0.03)',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Station Tag & Pulse Beacon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  {st.station_id}
                </span>
                <span className={`badge ${hasFault ? 'badge-critical' : (isWeather ? 'badge-warning' : 'badge-healthy')}`} style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem' }}>
                  {hasFault ? '🚨 SENSOR FAULT' : (isWeather ? '🌦️ WEATHER' : '🟢 ACTIVE')}
                </span>
              </div>

              {/* Station Name */}
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {st.name}
              </div>

              {/* Live Metric Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '900', color: hasFault ? 'var(--crimson-primary)' : 'var(--text-primary)', lineHeight: 1 }}>
                    {temp.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Droplets size={12} color="var(--blue-primary)" /> RH: {humidity.toFixed(0)}%
                  </div>
                </div>

                {/* Status Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: hasFault ? 'var(--crimson-light)' : 'var(--blue-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hasFault ? 'var(--crimson-primary)' : 'var(--blue-primary)'
                }}>
                  {hasFault ? <AlertTriangle size={18} className="pulse-active" /> : (isWeather ? <CloudRain size={18} /> : <Sun size={18} />)}
                </div>
              </div>

              {/* Mini Sparkline Bar Indicator */}
              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '9999px', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, Math.max(10, (temp / 50) * 100))}%`,
                  height: '100%',
                  background: hasFault ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #0284c7, #10b981)',
                  borderRadius: '9999px'
                }} />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
