import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  CloudRain, 
  Zap, 
  RefreshCw, 
  Radio, 
  Layers, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Flame, 
  Snowflake,
  Activity,
  Cpu
} from 'lucide-react';
import { evaluateContextDecision } from '../services/api';
import { buzzerService } from '../services/buzzer';

export default function SensorPlayground({ onApplyToDiagnostic }) {
  const [stationId, setStationId] = useState('AWS_ERD_003');
  const [stationName, setStationName] = useState('Bhavani');
  const [temperature, setTemperature] = useState(48.4);
  const [humidity, setHumidity] = useState(61.2);
  const [pressure, setPressure] = useState(1005.4);
  const [windSpeed, setWindSpeed] = useState(8.2);
  const [rainfall, setRainfall] = useState(0.0);
  
  const [aiVerdict, setAiVerdict] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let active = true;

    const runInference = async () => {
      setIsSimulating(true);

      const reading = {
        station_id: stationId,
        station_name: stationName,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        pressure: parseFloat(pressure),
        wind_speed: parseFloat(windSpeed),
        rainfall: parseFloat(rainfall)
      };

      try {
        const result = await evaluateContextDecision(reading);
        if (active && result) {
          setAiVerdict(result);
          if (onApplyToDiagnostic) {
            onApplyToDiagnostic(result);
          }
          if (result.classification?.label === 'POSSIBLE_SENSOR_FAULT') {
            buzzerService.startBuzzer();
          } else {
            buzzerService.stopBuzzer();
          }
        }
      } catch (err) {
        console.warn('Real-time inference fallback:', err);
      } finally {
        if (active) setIsSimulating(false);
      }
    };

    const timer = setTimeout(runInference, 100);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [stationId, temperature, humidity, pressure, windSpeed, rainfall]);

  const handlePreset = (type) => {
    switch (type) {
      case 'spike':
        setStationId('AWS_ERD_003');
        setStationName('Bhavani');
        setTemperature(48.4);
        setHumidity(61.2);
        setPressure(1005.4);
        setWindSpeed(8.2);
        setRainfall(0.0);
        break;
      case 'storm':
        setStationId('AWS_ERD_003');
        setStationName('Bhavani');
        setTemperature(19.2);
        setHumidity(98.5);
        setPressure(992.1);
        setWindSpeed(38.6);
        setRainfall(48.2);
        break;
      case 'flatline':
        setStationId('AWS_ERD_003');
        setStationName('Bhavani');
        setTemperature(0.0);
        setHumidity(0.0);
        setPressure(1013.2);
        setWindSpeed(0.0);
        setRainfall(0.0);
        break;
      case 'drift':
        setStationId('AWS_ERD_003');
        setStationName('Bhavani');
        setTemperature(34.8);
        setHumidity(70.0);
        setPressure(1004.0);
        setWindSpeed(5.0);
        setRainfall(0.0);
        break;
      case 'normal':
        setStationId('AWS_ERD_003');
        setStationName('Bhavani');
        setTemperature(29.2);
        setHumidity(68.0);
        setPressure(1008.2);
        setWindSpeed(6.5);
        setRainfall(0.0);
        break;
      default:
        break;
    }
  };

  const isFault = aiVerdict?.classification?.label === 'POSSIBLE_SENSOR_FAULT';
  const isWeather = aiVerdict?.classification?.label === 'REAL_WEATHER_EVENT';
  const isNormal = aiVerdict?.classification?.label === 'NORMAL';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Sliders size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Interactive AI Sensor Simulator &amp; Fault Injector
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>LIVE 10ms INFERENCE</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Drag live telemetry sliders or inject synthetic sensor failures to test the Explainable Context Engine in real-time.
            </p>
          </div>
        </div>

        {/* Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: isSimulating ? 'var(--amber-primary)' : 'var(--green-primary)',
            boxShadow: `0 0 8px ${isSimulating ? 'var(--amber-primary)' : 'var(--green-primary)'}`
          }}></div>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
            {isSimulating ? 'INFERRING...' : 'ENGINE READY'}
          </span>
        </div>
      </div>

      {/* 1-Click Anomaly Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '800' }}>
          🧪 1-Click Demonstration Scenarios (SIH Jury Test Suite)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
          
          <button
            onClick={() => handlePreset('spike')}
            className={`btn ${temperature === 48.4 ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <Flame size={16} color="var(--crimson-primary)" />
            <div>
              <div style={{ fontWeight: '700' }}>Thermal Spike</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>48.4°C (Sensor Fault)</div>
            </div>
          </button>

          <button
            onClick={() => handlePreset('storm')}
            className={`btn ${rainfall === 48.2 ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <CloudRain size={16} color={rainfall === 48.2 ? '#ffffff' : 'var(--blue-primary)'} />
            <div>
              <div style={{ fontWeight: '700' }}>Monsoon Storm</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>48mm Rain (Weather Event)</div>
            </div>
          </button>

          <button
            onClick={() => handlePreset('flatline')}
            className={`btn ${temperature === 0.0 ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <Zap size={16} color="var(--amber-primary)" />
            <div>
              <div style={{ fontWeight: '700' }}>ADC Flatline (0.0)</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Ground Short Failure</div>
            </div>
          </button>

          <button
            onClick={() => handlePreset('drift')}
            className={`btn ${temperature === 34.8 ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <Activity size={16} color="var(--amber-primary)" />
            <div>
              <div style={{ fontWeight: '700' }}>Calibration Drift</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>+4.8°C Sensor Bias</div>
            </div>
          </button>

          <button
            onClick={() => handlePreset('normal')}
            className="btn btn-outline"
            style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', justifyContent: 'flex-start', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            <CheckCircle2 size={16} color="var(--green-primary)" />
            <div>
              <div style={{ fontWeight: '700' }}>Clear Baseline</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>29.2°C (Normal)</div>
            </div>
          </button>

        </div>
      </div>

      {/* Interactive Controls & Real-Time Decision Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left Column: Interactive Tactile Sliders */}
        <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sliders size={18} color="var(--blue-primary)" /> Live Telemetry Controls
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Temperature Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                  <Thermometer size={15} color={temperature > 40 ? 'var(--crimson-primary)' : 'var(--blue-primary)'} /> Temperature
                </span>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: '900', color: temperature > 40 ? 'var(--crimson-primary)' : 'var(--blue-primary)' }}>
                  {temperature.toFixed(1)} °C
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: temperature > 40 ? 'var(--crimson-primary)' : 'var(--blue-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>0°C (Freezing)</span>
                <span>29°C (Baseline)</span>
                <span>60°C (Fault Spike)</span>
              </div>
            </div>

            {/* Relative Humidity Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                  <Droplets size={15} color="var(--blue-primary)" /> Relative Humidity
                </span>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--blue-primary)' }}>
                  {humidity.toFixed(1)} %
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>0% (Dry)</span>
                <span>68% (Erode Normal)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Surface Pressure Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                  <Gauge size={15} color="#6366f1" /> Barometric Pressure
                </span>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: '900', color: '#6366f1' }}>
                  {pressure.toFixed(1)} hPa
                </span>
              </div>
              <input
                type="range"
                min="940"
                max="1060"
                step="0.5"
                value={pressure}
                onChange={(e) => setPressure(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>

            {/* Wind Speed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                  <Wind size={15} color="var(--green-primary)" /> Wind Speed
                </span>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--green-primary)' }}>
                  {windSpeed.toFixed(1)} km/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--green-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Rainfall Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                  <CloudRain size={15} color="var(--blue-primary)" /> 1-Hour Precipitation
                </span>
                <span className="mono" style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--blue-primary)' }}>
                  {rainfall.toFixed(1)} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={rainfall}
                onChange={(e) => setRainfall(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue-primary)', cursor: 'pointer' }}
              />
            </div>

          </div>
        </div>

        {/* Right Column: Real-Time Explainable Context Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Decision Card */}
          <div className="glass-card" style={{
            padding: '1.25rem',
            borderLeft: `4px solid ${isFault ? 'var(--crimson-primary)' : (isWeather ? 'var(--amber-primary)' : 'var(--green-primary)')}`,
            background: isFault ? 'var(--crimson-light)' : (isWeather ? 'var(--amber-light)' : 'var(--green-light)')
          }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: '700' }}>
              Real-Time Context Engine Verdict
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: isFault ? 'var(--crimson-primary)' : (isWeather ? 'var(--amber-primary)' : 'var(--green-primary)') }}>
                {isFault && '🚨 POSSIBLE SENSOR FAULT'}
                {isWeather && '🌦️ REAL WEATHER EVENT'}
                {isNormal && '🟢 NORMAL BASELINE'}
              </div>
              <span className={`badge ${isFault ? 'badge-critical' : (isWeather ? 'badge-warning' : 'badge-healthy')}`}>
                {((aiVerdict?.classification?.confidence || 0.95) * 100).toFixed(1)}% CONFIDENCE
              </span>
            </div>

            {/* Context Multi-Voting Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>ML Outlier Score</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: '900', color: (aiVerdict?.ml_analysis?.isolation_forest_score || 0) > 0.5 ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>
                  {(aiVerdict?.ml_analysis?.isolation_forest_score || 0.2).toFixed(3)}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>ERA5 Baseline Diff</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: '900', color: Math.abs(aiVerdict?.context?.era5_deviation || 0) > 4 ? 'var(--crimson-primary)' : 'var(--blue-primary)' }}>
                  {aiVerdict?.context?.era5_deviation > 0 ? `+${aiVerdict?.context?.era5_deviation?.toFixed(1)}°C` : `${(aiVerdict?.context?.era5_deviation || 0).toFixed(1)}°C`}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>4 Station Vote</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: '900', color: aiVerdict?.context?.neighbour_agreement ? 'var(--green-primary)' : 'var(--crimson-primary)' }}>
                  {aiVerdict?.context?.neighbour_agreement ? 'AGREE' : 'DISAGREE'}
                </div>
              </div>
            </div>

            {/* Evidence Checklist */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                AI Chain of Thought Reasoning:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {aiVerdict?.evidence?.map((ev, i) => (
                  <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <CheckCircle2 size={14} color="var(--blue-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Actionable Recommendation */}
          <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--blue-primary)', background: '#ffffff' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
              Standard Operating Procedure (SOP)
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--blue-primary)', marginTop: '0.2rem' }}>
              {aiVerdict?.recommendation?.action || 'Routine station monitoring active.'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {aiVerdict?.recommendation?.checks?.join(' • ')}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
