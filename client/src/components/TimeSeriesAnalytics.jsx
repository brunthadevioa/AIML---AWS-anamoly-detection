import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  CloudRain, 
  Layers, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';

export default function TimeSeriesAnalytics({ stations = [] }) {
  const [selectedStationId, setSelectedStationId] = useState('AWS_ERD_003'); // Default Bhavani
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [timeRange, setTimeRange] = useState('24h');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate realistic 24-hour time-series data with isolated spike at Bhavani
  const timeSeriesData = useMemo(() => {
    const points = [];
    const isBhavani = selectedStationId === 'AWS_ERD_003';
    
    for (let i = 0; i < 24; i++) {
      const hour = `${String(i).padStart(2, '0')}:00`;
      
      const diurnal = Math.sin((i - 6) / 24 * Math.PI * 2) * 5 + 29;
      const era5Temp = diurnal + (Math.sin(i * 0.5) * 0.4);
      const neighborTemp = diurnal + (Math.cos(i * 0.7) * 0.6);
      
      let observedTemp = diurnal + (Math.sin(i * 1.2) * 0.5);
      let isAnomaly = false;
      let anomalyType = null;

      if (isBhavani && (i === 14 || i === 15)) {
        observedTemp = i === 14 ? 48.4 : 45.1;
        isAnomaly = true;
        anomalyType = 'SENSOR_FAULT';
      }

      const humidity = Math.max(35, Math.min(95, 90 - (observedTemp - 24) * 3.5));
      const era5Hum = Math.max(35, Math.min(95, 90 - (era5Temp - 24) * 3.5));
      const neighborHum = Math.max(35, Math.min(95, 90 - (neighborTemp - 24) * 3.5));

      const pressure = 1008 - (observedTemp - 28) * 0.3;
      const wind = Math.max(2, 6 + Math.sin(i * 0.8) * 4);
      const rain = (i >= 18 && i <= 20 && !isBhavani) ? 12.4 : 0.0;

      points.push({
        hour,
        index: i,
        temperature: observedTemp,
        era5_temperature: era5Temp,
        neighbor_temperature: neighborTemp,
        humidity: humidity,
        era5_humidity: era5Hum,
        neighbor_humidity: neighborHum,
        pressure: pressure,
        era5_pressure: 1007.8,
        wind_speed: wind,
        rainfall: rain,
        isAnomaly,
        anomalyType
      });
    }
    return points;
  }, [selectedStationId]);

  const metricConfigs = {
    temperature: { label: 'Temperature', unit: '°C', color: '#0284c7', faultColor: '#ef4444', min: 20, max: 55, icon: Thermometer },
    humidity: { label: 'Relative Humidity', unit: '%', color: '#0ea5e9', faultColor: '#f59e0b', min: 20, max: 100, icon: Droplets },
    pressure: { label: 'Surface Pressure', unit: 'hPa', color: '#6366f1', faultColor: '#ef4444', min: 990, max: 1025, icon: Gauge },
    wind_speed: { label: 'Wind Speed', unit: 'km/h', color: '#059669', faultColor: '#f59e0b', min: 0, max: 40, icon: Wind },
    rainfall: { label: 'Precipitation Rate', unit: 'mm', color: '#0284c7', faultColor: '#0284c7', min: 0, max: 50, icon: CloudRain }
  };

  const currentConfig = metricConfigs[selectedMetric];

  const svgWidth = 850;
  const svgHeight = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const getY = (val) => {
    const clamped = Math.max(currentConfig.min, Math.min(currentConfig.max, val));
    const ratio = (clamped - currentConfig.min) / (currentConfig.max - currentConfig.min);
    return padding.top + graphHeight - ratio * graphHeight;
  };

  const getX = (idx) => {
    return padding.left + (idx / 23) * graphWidth;
  };

  const makePath = (key) => {
    return timeSeriesData.reduce((acc, pt, i) => {
      const val = pt[key] !== undefined ? pt[key] : pt[selectedMetric];
      const x = getX(i);
      const y = getY(val);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  };

  const observedPath = makePath(selectedMetric);
  const era5Path = makePath(`era5_${selectedMetric}`);
  const neighborPath = makePath(`neighbor_${selectedMetric}`);

  const values = timeSeriesData.map(d => d[selectedMetric]);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length);
  const anomaliesFound = timeSeriesData.filter(d => d.isAnomaly).length;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
      
      {/* Header with Station & Metric Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={22} color="var(--blue-primary)" />
            24-Hour Telemetry Time-Series &amp; Anomaly Detection
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Comparing observed AWS telemetry against ERA5 Reanalysis and 4-station spatial consensus.
          </p>
        </div>

        {/* Station Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'AWS_ERD_001', name: 'Erode Town' },
            { id: 'AWS_ERD_002', name: 'Gobi' },
            { id: 'AWS_ERD_003', name: 'Bhavani (Alert)' },
            { id: 'AWS_ERD_004', name: 'Sathyamangalam' },
            { id: 'AWS_ERD_005', name: 'Perundurai' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStationId(st.id)}
              className={`btn ${selectedStationId === st.id ? (st.id === 'AWS_ERD_003' ? 'btn-danger' : 'btn-primary') : 'btn-outline'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(metricConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className="btn"
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  background: isActive ? 'var(--blue-light)' : '#f8fafc',
                  color: isActive ? 'var(--blue-primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--blue-primary)' : '1px solid #e2e8f0',
                  fontWeight: isActive ? '800' : '600'
                }}
              >
                <Icon size={15} /> {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '3px', background: currentConfig.color, display: 'inline-block', borderRadius: '2px' }}></span>
            <span>Observed AWS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '2px', background: '#64748b', borderTop: '2px dashed #64748b', display: 'inline-block' }}></span>
            <span>ERA5 Baseline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '2px', background: '#6366f1', display: 'inline-block' }}></span>
            <span>Neighbour Grid Mean</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + graphHeight * ratio;
            const val = currentConfig.max - ratio * (currentConfig.max - currentConfig.min);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {val.toFixed(0)}{currentConfig.unit}
                </text>
              </g>
            );
          })}

          {/* Anomaly Highlight Box */}
          {selectedStationId === 'AWS_ERD_003' && selectedMetric === 'temperature' && (
            <g>
              <rect
                x={getX(13.5)}
                y={padding.top}
                width={getX(15.5) - getX(13.5)}
                height={graphHeight}
                fill="rgba(239, 68, 68, 0.12)"
                stroke="rgba(239, 68, 68, 0.4)"
                strokeDasharray="3 3"
                rx="4"
              />
              <text
                x={(getX(13.5) + getX(15.5)) / 2}
                y={padding.top + 15}
                fill="var(--crimson-primary)"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                🚨 SENSOR FAULT DETECTED
              </text>
            </g>
          )}

          {/* ERA5 Baseline */}
          <path
            d={era5Path}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Neighbour Mean */}
          <path
            d={neighborPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
          />

          {/* Physical AWS Observed */}
          <path
            d={observedPath}
            fill="none"
            stroke={selectedStationId === 'AWS_ERD_003' && selectedMetric === 'temperature' ? 'var(--crimson-primary)' : currentConfig.color}
            strokeWidth="3"
          />

          {/* Data Points */}
          {timeSeriesData.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt[selectedMetric]);
            const isHovered = hoveredIndex === i;
            const isSpike = pt.isAnomaly;

            return (
              <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSpike ? 6 : (isHovered ? 5 : 3)}
                  fill={isSpike ? 'var(--crimson-primary)' : currentConfig.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {timeSeriesData.filter((_, i) => i % 3 === 0).map((pt, i) => {
            const x = getX(pt.index);
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {pt.hour}
              </text>
            );
          })}

          {/* Hover Crosshair Tooltip */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + graphHeight}
                stroke="var(--blue-primary)"
                strokeDasharray="2 2"
              />
            </g>
          )}

        </svg>

        {/* Floating Tooltip Box */}
        {hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            background: '#ffffff',
            border: '1px solid var(--blue-primary)',
            boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            fontSize: '0.75rem',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Time: {timeSeriesData[hoveredIndex].hour} IST
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ color: currentConfig.color, fontWeight: '700' }}>
                AWS Observed: {timeSeriesData[hoveredIndex][selectedMetric].toFixed(1)} {currentConfig.unit}
              </div>
              <div style={{ color: '#64748b' }}>
                ERA5 Baseline: {timeSeriesData[hoveredIndex][`era5_${selectedMetric}`]?.toFixed(1)} {currentConfig.unit}
              </div>
              <div style={{ color: '#6366f1' }}>
                Neighbour Mean: {timeSeriesData[hoveredIndex][`neighbor_${selectedMetric}`]?.toFixed(1)} {currentConfig.unit}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4 Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '0.85rem', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Peak 24h Maximum</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: '900', color: maxVal > 40 ? 'var(--crimson-primary)' : 'var(--text-primary)' }}>
            {maxVal.toFixed(1)} {currentConfig.unit}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.85rem', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>24h Minimum</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {minVal.toFixed(1)} {currentConfig.unit}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.85rem', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Diurnal Mean</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--blue-primary)' }}>
            {avgVal.toFixed(1)} {currentConfig.unit}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.85rem', borderLeft: anomaliesFound > 0 ? '4px solid var(--crimson-primary)' : '4px solid var(--green-primary)', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Anomalies Flagged</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: '900', color: anomaliesFound > 0 ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>
            {anomaliesFound > 0 ? `${anomaliesFound} Critical Spike` : '0 (Stable)'}
          </div>
        </div>

      </div>

    </div>
  );
}
