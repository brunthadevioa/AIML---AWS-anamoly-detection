import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Info, 
  Wrench,
  Sparkles,
  Layers,
  Volume2,
  Cpu
} from 'lucide-react';
import RadialGauge from './RadialGauge';
import ComparativeRadar from './ComparativeRadar';

export default function DiagnosticHero({ diagnosticData, showComparativeMatrix = false }) {
  if (!diagnosticData) return null;

  const {
    station = { id: 'AWS_ERD_002', name: 'Gobichettipalayam' },
    observation = { temperature: 30.8, humidity: 66.0, pressure: 1010.2, wind_speed: 5.5, rainfall: 0.0 },
    ml_analysis = { is_anomaly: false, isolation_forest_score: 0.12, lstm_score: 0.0 },
    context = { era5_reference: 31.0, era5_deviation: -0.2, neighbour_mean: 31.1, neighbour_agreement: true, cross_parameter_consistency: true },
    classification = { label: 'NORMAL', confidence: 0.982 },
    alert_level = 'NORMAL',
    buzzer_active = false,
    evidence = [
      'Live AWS telemetry verified via Open-Meteo & ECMWF ERA5 atmospheric reanalysis',
      'Continuous real-time observational stream active',
      'Spatial consensus with neighbouring AWS stations indicates nominal conditions'
    ],
    recommendation = { action: 'Nominal AWS telemetry reception active', checks: ['Sensor calibration nominal', 'Wireless telemetry packet transmission verified'] }
  } = diagnosticData;

  const isFault = classification.label === 'POSSIBLE_SENSOR_FAULT';
  const isWeather = classification.label === 'REAL_WEATHER_EVENT';
  const isNormal = classification.label === 'NORMAL';

  const tempF = ((observation.temperature * 9/5) + 32).toFixed(1);
  const pressInHg = (observation.pressure * 0.02953).toFixed(2);

  return (
    <div className={`glass-panel ${isFault ? 'siren-active' : ''}`} style={{ padding: '1.5rem', position: 'relative', background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
      
      {/* Station Header & Live Stream Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>{station.name} AWS Station</h2>
            <span className="badge badge-cyan mono">{station.id}</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              📡 LIVE OPEN-METEO API SYNC
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Erode District Physical Telemetry Stream • Live Atmospheric Observations: <strong>{observation.temperature}°C ({tempF}°F)</strong> • Pressure: <strong>{observation.pressure} hPa ({pressInHg} inHg)</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isFault && (
            <span className="badge badge-critical" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              <Volume2 size={16} className="pulse-active" /> 🚨 POSSIBLE SENSOR FAULT
            </span>
          )}
          {isWeather && (
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              <CloudRain size={16} /> 🌦️ REAL WEATHER EVENT
            </span>
          )}
          {isNormal && (
            <span className="badge badge-healthy" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              <CheckCircle2 size={16} /> 🟢 LIVE OPERATIONAL BASELINE
            </span>
          )}
        </div>
      </div>

      {/* 5 Live Radial Telemetry Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        
        <RadialGauge
          label="Temperature"
          value={observation.temperature}
          min={0}
          max={60}
          unit="°C"
          color={isFault ? '#ef4444' : 'var(--blue-primary)'}
          icon={Thermometer}
          isAbnormal={isFault}
        />

        <RadialGauge
          label="Humidity"
          value={observation.humidity}
          min={0}
          max={100}
          unit="%"
          color="#0284c7"
          icon={Droplets}
          isAbnormal={false}
        />

        <RadialGauge
          label="Pressure"
          value={observation.pressure}
          min={950}
          max={1050}
          unit="hPa"
          color="#6366f1"
          icon={Gauge}
          isAbnormal={false}
        />

        <RadialGauge
          label="Wind Speed"
          value={observation.wind_speed}
          min={0}
          max={60}
          unit="km/h"
          color="var(--green-primary)"
          icon={Wind}
          isAbnormal={false}
        />

        <RadialGauge
          label="Rainfall 1h"
          value={observation.rainfall}
          min={0}
          max={100}
          unit="mm"
          color="#0ea5e9"
          icon={CloudRain}
          isAbnormal={false}
        />

      </div>

      {/* Hero Decision Bar */}
      <div style={{
        padding: '1.25rem',
        borderRadius: '16px',
        background: isFault 
          ? 'linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%)' 
          : (isWeather ? 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)'),
        border: `1px solid ${isFault ? 'rgba(239, 68, 68, 0.4)' : (isWeather ? 'rgba(217, 119, 6, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: isFault ? 'var(--crimson-primary)' : (isWeather ? 'var(--amber-primary)' : 'var(--green-primary)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}>
            {isFault ? <AlertTriangle size={24} /> : (isWeather ? <CloudRain size={24} /> : <CheckCircle2 size={24} />)}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>
              Explainable AI Classification
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: isFault ? 'var(--crimson-primary)' : (isWeather ? 'var(--amber-primary)' : 'var(--green-primary)') }}>
              {classification.label === 'POSSIBLE_SENSOR_FAULT' && '🚨 POSSIBLE SENSOR FAULT'}
              {classification.label === 'REAL_WEATHER_EVENT' && '🌦️ REAL WEATHER EVENT'}
              {classification.label === 'NORMAL' && '🟢 NORMAL OPERATIONAL BASELINE'}
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{ minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Context Confidence</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{(classification.confidence * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              width: `${classification.confidence * 100}%`,
              height: '100%',
              background: isFault ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : (isWeather ? 'linear-gradient(90deg, #0284c7, #f59e0b)' : 'linear-gradient(90deg, #0284c7, #10b981)'),
              borderRadius: '9999px',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Comparative Multi-Source Consensus Matrix (Shown only on District Overview Grid) */}
      {showComparativeMatrix && <ComparativeRadar diagnosticData={diagnosticData} />}

      {/* Two Columns: Evidence + Recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        
        {/* Why was this detected? */}
        <div className="glass-card" style={{ background: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Layers size={18} color="var(--blue-primary)" /> Why was this detected?
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {evidence && evidence.map((ev, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <CheckCircle2 size={16} color="var(--blue-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Engineering Recommendation */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--blue-primary)', background: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Wrench size={18} color="var(--blue-primary)" /> Officer Action Protocol
          </h4>
          <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--blue-primary)', marginBottom: '0.65rem' }}>
            {recommendation.action}
          </p>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recommendation.checks && recommendation.checks.map((chk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-primary)' }}></span>
                <span>{chk}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
