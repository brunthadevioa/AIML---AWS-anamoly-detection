import React from 'react';
import { Shield, MapPin, User, ArrowRight, Info, Sliders, LogIn, UserPlus } from 'lucide-react';

export default function PublicNavbar({ 
  currentPath, 
  onNavigate 
}) {
  return (
    <header style={{ position: 'sticky', top: '0.75rem', zIndex: 1000, padding: '0 1.5rem', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      <nav style={{
        padding: '0.85rem 1.75rem',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
          }}>
            <Shield size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.04em', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                SKYGUARD
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem' }}>
                AI METEOROLOGY
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={11} color="var(--blue-primary)" /> Erode District AWS Sensor Intelligence Network
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigate('landing')}
            className={`btn ${currentPath === 'landing' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', border: currentPath === 'landing' ? 'none' : '1px solid #e2e8f0' }}
          >
            Welcome
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`btn ${currentPath === 'about' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', border: currentPath === 'about' ? 'none' : '1px solid #e2e8f0' }}
          >
            <Info size={15} /> AI Science &amp; Docs
          </button>
        </div>

        {/* Top Right: Login & Register */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '12px' }}
          >
            <LogIn size={15} /> Officer Login
          </button>

          <button
            onClick={() => onNavigate('register')}
            className="btn btn-outline"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', borderRadius: '12px', background: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <UserPlus size={15} /> Register
          </button>
        </div>

      </nav>
    </header>
  );
}
