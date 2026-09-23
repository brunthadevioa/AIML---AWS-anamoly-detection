import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Sliders, 
  TrendingUp, 
  MapPin, 
  Bell, 
  UploadCloud, 
  FileText, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Clock, 
  Radio, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Home,
  AlertTriangle,
  Cpu,
  Layers,
  RadioTower
} from 'lucide-react';
import { buzzerService } from '../services/buzzer';

export default function OfficerCommandLayout({
  activeView,
  setActiveView,
  user,
  onLogout,
  onBackToPublic,
  alertCount,
  isBuzzerActive,
  onSilenceBuzzer,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const navItems = [
    { id: 'stations', label: '5-Station District Grid', icon: RadioTower, category: 'Stations' },
    { id: 'station_AWS_ERD_001', label: 'Erode Town Central', icon: MapPin, category: 'Stations' },
    { id: 'station_AWS_ERD_002', label: 'Gobichettipalayam', icon: MapPin, category: 'Stations' },
    { id: 'station_AWS_ERD_003', label: 'Bhavani Station', icon: MapPin, category: 'Stations' },
    { id: 'station_AWS_ERD_004', label: 'Sathyamangalam', icon: MapPin, category: 'Stations' },
    { id: 'station_AWS_ERD_005', label: 'Perundurai Station', icon: MapPin, category: 'Stations' },
    { id: 'dataset_repair', label: 'AI Data Repair & Cleaner', icon: UploadCloud, category: 'Tools' },
    { id: 'alerts', label: 'Incident & Alarm Desk', icon: Bell, badge: alertCount, category: 'Tools' },
    { id: 'map', label: 'District GIS Radar Map', icon: MapPin, category: 'Tools' },
    { id: 'analytics', label: '24h Time-Series Trends', icon: TrendingUp, category: 'Tools' },
    { id: 'simulator', label: 'AI Simulation Sandbox', icon: Sliders, category: 'Tools' },
    { id: 'reports', label: 'Incident Audit Reports', icon: FileText, category: 'Tools' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: sidebarCollapsed ? '80px' : '280px',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        background: '#ffffff',
        borderRight: '1px solid rgba(226, 232, 240, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(15, 23, 42, 0.03)'
      }}>
        
        {/* Top: Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: '1.25rem', padding: '0 0.5rem', flexShrink: 0 }}>
            {!sidebarCollapsed && (
              <div 
                onClick={onBackToPublic}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
                title="Return to Welcome Page"
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}>
                  <Shield size={22} color="#ffffff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>SKYGUARD</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--blue-primary)', fontWeight: '800' }}>OFFICER DESK</div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Scrollable Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
            
            {!sidebarCollapsed && (
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.4rem 0.6rem 0.2rem 0.6rem' }}>
                AWS Stations
              </div>
            )}

            {navItems.filter(n => n.category === 'Stations').map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: isActive ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid transparent',
                    background: isActive ? 'var(--blue-light)' : 'transparent',
                    color: isActive ? 'var(--blue-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none',
                    position: 'relative'
                  }}
                  title={item.label}
                >
                  <Icon size={17} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}

            {!sidebarCollapsed && (
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.6rem 0.2rem 0.6rem' }}>
                AI &amp; Quality Tools
              </div>
            )}

            {navItems.filter(n => n.category === 'Tools').map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: isActive ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid transparent',
                    background: isActive ? 'var(--blue-light)' : 'transparent',
                    color: isActive ? 'var(--blue-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none',
                    position: 'relative'
                  }}
                  title={item.label}
                >
                  <Icon size={17} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  
                  {item.badge > 0 && !sidebarCollapsed && (
                    <span style={{
                      marginLeft: 'auto',
                      background: 'var(--crimson-primary)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Return to Home & Officer Info */}
        <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.9)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <button
            onClick={onBackToPublic}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '700',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
            title="Return to Public Welcome Page"
          >
            <Home size={16} />
            {!sidebarCollapsed && <span>Exit to Public Portal</span>}
          </button>

          {/* Officer Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '12px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'var(--blue-primary)', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '0.82rem', flexShrink: 0
            }}>
              DO
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || 'District Officer'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Erode District Desk
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

        </div>

      </aside>

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Top Header Bar inside Dashboard */}
        <header style={{
          padding: '0.85rem 1.75rem',
          background: '#ffffff',
          borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
        }}>
          {/* Active View Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem' }}>
              <Radio size={12} className="pulse-active" /> LIVE DISPATCH
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
              {navItems.find(n => n.id === activeView)?.label || 'Live Station Monitor'}
            </div>
          </div>

          {/* Right Status Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Buzzer Alert Notification Button */}
            {isBuzzerActive && (
              <button
                onClick={onSilenceBuzzer}
                className="btn btn-danger"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.78rem',
                  animation: 'siren-pulse 1s infinite'
                }}
              >
                <Volume2 size={16} /> Silence Hardware Siren
              </button>
            )}

            {/* Mute Button */}
            <button
              onClick={handleToggleMute}
              className="btn btn-outline"
              title={muted ? 'Unmute Audio Buzzer' : 'Mute Audio Buzzer'}
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem', color: muted ? 'var(--text-muted)' : 'var(--blue-primary)' }}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Digital Clock */}
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <Clock size={13} color="var(--blue-primary)" />
              <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{istString} IST</span>
              <span>•</span>
              <span>{utcString} UTC</span>
            </div>

          </div>
        </header>

        {/* Workspace Container */}
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>

      </div>

    </div>
  );
}
