import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Volume2, 
  VolumeX, 
  MapPin, 
  FileText, 
  UploadCloud, 
  Bell, 
  Info, 
  User as UserIcon,
  LogOut,
  Sliders,
  TrendingUp,
  Radio,
  Clock,
  Home,
  Layers,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { buzzerService } from '../services/buzzer';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  alertCount, 
  isBuzzerActive, 
  onSilenceBuzzer 
}) {
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = buzzerService.toggleMute();
    setMuted(isNowMuted);
    if (isNowMuted && isBuzzerActive) {
      onSilenceBuzzer();
    }
  };

  const istString = time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
  const utcString = time.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false });

  const isPublicView = activeTab === 'landing' || activeTab === 'about' || activeTab === 'login' || activeTab === 'register';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '0.4rem 1rem' }}>
      
      {/* Top Ticker Status Bar */}
      <div style={{
        background: 'rgba(5, 8, 17, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '0.25rem 1rem',
        marginBottom: '0.35rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.68rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <span className="badge badge-critical" style={{ fontSize: '0.58rem', padding: '0.1rem 0.4rem' }}>
            <Radio size={10} className="pulse-active" /> ERODE AWS GRID
          </span>
          <div className="mono" style={{ color: '#e2e8f0', whiteSpace: 'nowrap' }}>
            ⚡ AWS_ERD_003 (Bhavani) SPIKE DETECTED [48.4°C] • ERA5 BASELINE: 29.5°C • DUAL AI CONFIDENCE: 91.6% • 5/5 AWS SENSORS ACTIVE
          </div>
        </div>

        {/* Digital Military Clocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }} className="mono">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-cyan)' }}>
            <Clock size={11} /> <span>{istString} IST</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            <span>{utcString} UTC</span>
          </div>
        </div>
      </div>

      {/* Main Glass Nav */}
      <nav className="glass-panel" style={{ padding: '0.65rem 1.25rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Brand Logo -> Links to Welcome Page */}
          <div 
            onClick={() => setActiveTab('landing')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            title="Click to go to Welcome Page"
          >
            <div style={{
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}>
              <Shield size={22} color="#050811" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.04em', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  VAAYU
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>
                  AI CORE
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={11} color="var(--neon-cyan)" /> Erode District AWS Network
              </div>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem', 
            background: 'rgba(5, 8, 17, 0.7)', 
            padding: '0.3rem', 
            borderRadius: '14px', 
            border: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {/* Public or Common Nav */}
            <button
              className={`btn ${activeTab === 'landing' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('landing')}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'landing' ? 'none' : 'transparent' }}
            >
              <Home size={14} /> Welcome
            </button>

            <button
              className={`btn ${activeTab === 'about' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('about')}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'about' ? 'none' : 'transparent' }}
            >
              <Info size={14} /> AI Architecture
            </button>

            {/* Officer Dashboard Tabs */}
            {(!isPublicView || user) && (
              <>
                <button
                  className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('overview')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'overview' ? 'none' : 'transparent' }}
                >
                  <Activity size={14} /> Overview
                </button>
                
                <button
                  className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('simulator')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'simulator' ? 'none' : 'transparent' }}
                >
                  <Sliders size={14} /> AI Sandbox
                </button>

                <button
                  className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('analytics')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'analytics' ? 'none' : 'transparent' }}
                >
                  <TrendingUp size={14} /> Time-Series
                </button>

                <button
                  className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('map')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'map' ? 'none' : 'transparent' }}
                >
                  <MapPin size={14} /> GIS Map
                </button>

                <button
                  className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('alerts')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'alerts' ? 'none' : 'transparent', position: 'relative' }}
                >
                  <Bell size={14} /> Alerts
                  {alertCount > 0 && (
                    <span style={{ 
                      position: 'absolute', top: '-4px', right: '-4px', 
                      background: '#ff2a5f', color: '#fff', fontSize: '0.6rem', 
                      fontWeight: '800', borderRadius: '9999px', width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(255, 42, 95, 0.8)'
                    }}>
                      {alertCount}
                    </span>
                  )}
                </button>

                <button
                  className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('upload')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'upload' ? 'none' : 'transparent' }}
                >
                  <UploadCloud size={14} /> Upload CSV
                </button>

                <button
                  className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('reports')}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', border: activeTab === 'reports' ? 'none' : 'transparent' }}
                >
                  <FileText size={14} /> Reports
                </button>
              </>
            )}
          </div>

          {/* Right Controls: Buzzer + Login / Officer Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            
            {/* Audio Buzzer Silence Button */}
            {isBuzzerActive && (
              <button
                onClick={onSilenceBuzzer}
                className="btn btn-danger"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  animation: 'siren-pulse 1s infinite'
                }}
              >
                <Volume2 size={15} /> Silence Siren
              </button>
            )}

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className="btn btn-outline"
              title={muted ? 'Unmute Audio Buzzer' : 'Mute Audio Buzzer'}
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem', color: muted ? 'var(--text-muted)' : 'var(--neon-cyan)' }}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* User Profile or Login Buttons */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.65rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--neon-cyan)', color: '#050811', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                  DO
                </div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: '700', color: '#fff' }}>Officer Portal</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Erode District</div>
                </div>
                <button
                  onClick={onLogout}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '0.25rem' }}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setActiveTab('login')}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                >
                  <UserIcon size={14} /> Officer Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                >
                  Register
                </button>
              </div>
            )}

          </div>

        </div>
      </nav>
    </header>
  );
}
