import React, { useState } from 'react';
import { 
  Shield, 
  CloudRain, 
  Radio, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  Cpu,
  Flame,
  Zap,
  ChevronRight,
  Compass,
  FileText,
  Thermometer,
  LogIn
} from 'lucide-react';

export default function LandingPage({ onEnterDashboard, onOpenLogin, onOpenRegister, onOpenAbout }) {
  const [demoMode, setDemoMode] = useState('fault'); // 'fault' | 'weather'

  const stationsSummary = [
    { id: 'AWS_ERD_001', name: 'Erode Town Central', temp: 31.2, hum: 63, pres: 1010.8, status: 'NORMAL', health: 98.6 },
    { id: 'AWS_ERD_002', name: 'Gobichettipalayam', temp: 30.8, hum: 66, pres: 1010.2, status: 'NORMAL', health: 99.1 },
    { id: 'AWS_ERD_003', name: 'Bhavani', temp: 31.0, hum: 64, pres: 1010.5, status: 'NORMAL', health: 97.4 },
    { id: 'AWS_ERD_004', name: 'Sathyamangalam', temp: 30.4, hum: 68, pres: 1009.5, status: 'NORMAL', health: 98.1 },
    { id: 'AWS_ERD_005', name: 'Perundurai', temp: 31.0, hum: 65, pres: 1010.1, status: 'NORMAL', health: 96.8 },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Container */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '1rem 1.5rem 4rem 1.5rem', width: '100%' }}>
        
        {/* Top Status Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--blue-light)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '14px',
          padding: '0.65rem 1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
              <Radio size={12} className="pulse-active" /> LIVE MONITORING
            </span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--blue-primary)', fontWeight: '800', letterSpacing: '0.04em' }}>
              TAMIL NADU METEOROLOGICAL NETWORK • ERODE DISTRICT AWS GRID
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>ECMWF ERA5 Baseline: <strong style={{ color: 'var(--green-primary)' }}>Synchronized</strong></span>
            <span>•</span>
            <span style={{ color: 'var(--green-primary)', fontWeight: '800' }}>● 5 Stations Online</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="glass-panel" style={{
          padding: '4.5rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '3.5rem',
          borderRadius: '32px',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #f0fdf4 100%)',
          boxShadow: '0 20px 50px -10px rgba(2, 132, 199, 0.1), 0 10px 25px -5px rgba(16, 185, 129, 0.06)'
        }}>
          
          {/* Radiant Background Aura */}
          <div style={{
            position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
            width: '900px', height: '500px',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none'
          }} />

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--blue-light)',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            padding: '0.45rem 1.25rem',
            borderRadius: '9999px',
            marginBottom: '1.75rem'
          }}>
            <Radio size={14} className="pulse-active" color="var(--blue-primary)" />
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--blue-primary)', fontWeight: '800', letterSpacing: '0.05em' }}>
              SKYGUARD • INTELLIGENT METEOROLOGICAL QUALITY ASSURANCE
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
            fontWeight: '900',
            lineHeight: 1.12,
            color: 'var(--text-primary)',
            maxWidth: '1050px',
            margin: '0 auto 1.5rem auto',
            letterSpacing: '-0.03em'
          }}>
            Precision Weather Anomaly &amp; <br />
            <span style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #059669 50%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AWS Sensor Quality Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '840px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6,
            fontWeight: '400'
          }}>
            Eliminating false disaster alarms across Automated Weather Stations. SKYGUARD utilizes <strong style={{ color: 'var(--blue-primary)' }}>Isolation Forest</strong>, <strong style={{ color: 'var(--green-primary)' }}>ERA5 Atmospheric Reanalysis</strong>, and <strong style={{ color: '#6366f1' }}>Spatial Consensus</strong> to definitively distinguish extreme climate events from hardware sensor faults.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button 
              onClick={onOpenLogin} 
              className="btn btn-primary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1.1rem', borderRadius: '14px' }}
            >
              <LogIn size={20} /> Access Officer Console <ArrowRight size={20} />
            </button>
            
            <button 
              onClick={onOpenRegister} 
              className="btn btn-outline"
              style={{ padding: '0.95rem 2rem', fontSize: '1.1rem', borderRadius: '14px', background: '#ffffff' }}
            >
              Register Officer ID
            </button>

            <button 
              onClick={onOpenAbout} 
              className="btn btn-outline"
              style={{ padding: '0.95rem 1.75rem', fontSize: '1.1rem', borderRadius: '14px', background: '#ffffff' }}
            >
              📑 AI Science &amp; Docs
            </button>
          </div>

          {/* Interactive Live Preview Sandbox */}
          <div className="glass-card" style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'left',
            borderRadius: '24px',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            background: '#ffffff',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(2, 132, 199, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>
                  Interactive AI Diagnosis Sandbox (Try Case A vs Case B)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  Bhavani AWS Station (<span className="mono" style={{ color: 'var(--blue-primary)' }}>AWS_ERD_003</span>)
                </div>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setDemoMode('fault')}
                  className={`btn ${demoMode === 'fault' ? 'btn-danger' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  <Flame size={15} /> Case A: Sensor Spike (48.4°C)
                </button>
                <button
                  onClick={() => setDemoMode('weather')}
                  className={`btn ${demoMode === 'weather' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  <CloudRain size={15} /> Case B: Monsoon Cloudburst
                </button>
              </div>
            </div>

            {/* Evidence Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: demoMode === 'fault' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>1. Physical AWS Telemetry</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: '900', color: demoMode === 'fault' ? 'var(--crimson-primary)' : 'var(--green-primary)', marginTop: '0.35rem' }}>
                  {demoMode === 'fault' ? '48.4°C' : '19.2°C • 48mm Rain'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {demoMode === 'fault' ? '🔴 Extreme Isolated Reading' : '🌧️ Convective Precipitation'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(2,132,199,0.3)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>2. ERA5 Atmospheric Baseline</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--blue-primary)', marginTop: '0.35rem' }}>
                  28.2°C
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Deviation: <strong style={{ color: demoMode === 'fault' ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>{demoMode === 'fault' ? '+20.2°C (Discrepant)' : '-9.0°C (Consistent)'}</strong>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.3)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>3. 4 Neighbour Stations Mean</div>
                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: '900', color: '#6366f1', marginTop: '0.35rem' }}>
                  {demoMode === 'fault' ? '27.9°C' : '18.9°C'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Spatial Consensus: <strong style={{ color: demoMode === 'fault' ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>{demoMode === 'fault' ? '✗ Disagrees (Fault)' : '✓ Agrees (Storm)'}</strong>
                </div>
              </div>

            </div>

            {/* Verdict Strip */}
            <div style={{
              background: demoMode === 'fault' ? 'var(--crimson-light)' : 'var(--green-light)',
              border: demoMode === 'fault' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {demoMode === 'fault' ? (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--crimson-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)' }}>
                    <Flame size={22} />
                  </div>
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)' }}>
                    <CheckCircle2 size={22} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: demoMode === 'fault' ? 'var(--crimson-primary)' : 'var(--green-primary)' }}>
                    {demoMode === 'fault' ? '🚨 POSSIBLE SENSOR FAULT (91.6% Confidence)' : '🌦️ REAL REGIONAL WEATHER EVENT (88.4% Confidence)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {demoMode === 'fault' ? 'Acoustic Synthesizer Buzzer Activated • Dispatched Field Engineer to Bhavani' : 'System Buzzer Silent • Broadcasted Regional Heavy Rainfall Alert'}
                  </div>
                </div>
              </div>

              <button 
                onClick={onOpenLogin} 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
              >
                Sign In to Console <ChevronRight size={16} />
              </button>
            </div>

          </div>

        </section>

        {/* Live Erode District AWS Grid Overview */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>PUBLIC TELEMETRY GRID</span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                Live Erode District 5-Station AWS Array
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Real-time meteorological readings and hardware integrity health scores across Erode District.
              </p>
            </div>

            <button 
              onClick={onOpenLogin} 
              className="btn btn-outline" 
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', background: '#ffffff' }}
            >
              Sign In to Inspect Telemetry <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {stationsSummary.map((st) => (
              <div
                key={st.id}
                onClick={onOpenLogin}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderRadius: '18px',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{st.id}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                    🟢 ONLINE &amp; SYNCHRONIZED
                  </span>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {st.name}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {st.temp.toFixed(1)}°C
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '0.5rem' }}>
                      <span>RH: {st.hum}%</span>
                      <span>•</span>
                      <span>{st.pres} hPa</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Health Score</div>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--green-primary)' }}>
                      {st.health}%
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* 3-Tier AI Science Pipeline */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>AI/ML METHODOLOGY</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
              How SKYGUARD Assures Sensor Data Integrity
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0.5rem auto 0 auto', fontSize: '0.95rem' }}>
              A 3-step hierarchical pipeline merging statistical machine learning with spatial atmospheric physics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--blue-primary)', background: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--blue-primary)' }}>
                <Cpu size={26} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tier 1: Machine Learning Core
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.35rem 0 0.65rem 0' }}>
                Isolation Forest + Temporal Model
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Fast statistical outlier isolation detects sudden spikes, frozen readings, flatlines, and slow calibration drift in under 4ms.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid var(--green-primary)', background: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--green-primary)' }}>
                <Layers size={26} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tier 2: Atmospheric Reanalysis
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.35rem 0 0.65rem 0' }}>
                ERA5 Reanalysis Baseline
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Cross-references every sensor reading against ECMWF ERA5 atmospheric reanalysis, providing an objective ground-truth baseline independent of hardware flaws.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid #6366f1', background: '#ffffff' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#6366f1' }}>
                <Compass size={26} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tier 3: Spatial &amp; Physical Consensus
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.35rem 0 0.65rem 0' }}>
                Neighbour Station Consensus
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enforces physical thermodynamic laws (rain cools air, pressure drops before storms) and compares adjacent Erode stations to eliminate false alarms.
              </p>
            </div>

          </div>
        </section>

      </div>

      {/* Modern Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '2.5rem 1.5rem',
        marginTop: 'auto',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>SKYGUARD</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automated Weather Station Intelligence Platform</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Erode District Pilot • Tamil Nadu Meteorological Network • ERA5 Reanalysis Integrated
          </div>
        </div>
      </footer>

    </div>
  );
}
