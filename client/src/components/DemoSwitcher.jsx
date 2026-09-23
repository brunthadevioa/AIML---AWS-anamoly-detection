import React from 'react';
import { Play, Flame, CloudLightning, RefreshCw, Sparkles } from 'lucide-react';
import { predictReading } from '../services/api';
import { buzzerService } from '../services/buzzer';

export default function DemoSwitcher({ onApplyScenario, isRunning, setIsRunning }) {
  
  // Case A: Sensor Fault Simulation (Bhavani Temperature Spike 48.4°C)
  const handleRunCaseA = async () => {
    setIsRunning(true);
    try {
      const result = await predictReading({
        station_id: 'AWS_ERD_003', // Bhavani
        temperature: 48.4,
        humidity: 61.2,
        pressure: 1005.4,
        wind_speed: 8.2,
        rainfall: 0.0,
      });

      onApplyScenario(result);
      if (result.buzzer_active) {
        buzzerService.startBuzzer();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  // Case B: Real Weather Event Simulation (Regional Monsoon Storm across Erode)
  const handleRunCaseB = async () => {
    setIsRunning(true);
    buzzerService.stopBuzzer();
    try {
      const result = await predictReading({
        station_id: 'AWS_ERD_001', // Erode Town
        temperature: 39.5,
        humidity: 32.0,
        pressure: 988.2,
        wind_speed: 28.5,
        rainfall: 12.4,
      });

      onApplyScenario(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset to Normal Baseline (Gobi)
  const handleResetNormal = async () => {
    setIsRunning(true);
    buzzerService.stopBuzzer();
    try {
      const result = await predictReading({
        station_id: 'AWS_ERD_002', // Gobi
        temperature: 29.2,
        humidity: 68.5,
        pressure: 996.1,
        wind_speed: 4.5,
        rainfall: 0.0,
      });

      onApplyScenario(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--cyan-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
            🎬 Live Demonstration Mode
          </h3>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SIH Jury Quick-Test</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: '0.5rem' }}>
        
        {/* Case A */}
        <button
          onClick={handleRunCaseA}
          disabled={isRunning}
          className="btn btn-outline"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            padding: '0.65rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontWeight: '700', fontSize: '0.8rem' }}>
            <Flame size={14} /> Case A — Sensor Fault
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            48.4°C Spike • 🔊 Audio Buzzer
          </div>
        </button>

        {/* Case B */}
        <button
          onClick={handleRunCaseB}
          disabled={isRunning}
          className="btn btn-outline"
          style={{
            borderColor: 'rgba(245, 158, 11, 0.4)',
            background: 'rgba(245, 158, 11, 0.08)',
            padding: '0.65rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: '700', fontSize: '0.8rem' }}>
            <CloudLightning size={14} /> Case B — Weather Event
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Multi-Station Consensus • 🔇 Silent
          </div>
        </button>

        {/* Reset */}
        <button
          onClick={handleResetNormal}
          disabled={isRunning}
          className="btn btn-outline"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '0.65rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: '700', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Reset Normal
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Baseline Stream
          </div>
        </button>

      </div>
    </div>
  );
}
