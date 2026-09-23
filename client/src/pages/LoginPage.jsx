import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Zap, KeyRound, User, ArrowLeft, Radio, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onSwitchToRegister, onBackToHome }) {
  const [email, setEmail] = useState('officer@skyguard.tn.gov.in');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('officer');
  const [loading, setLoading] = useState(false);

  // Standard Form Submit (Instantaneous)
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const userData = {
      name: email.includes('engineer') ? 'Field AWS Engineer' : (email.includes('scientist') ? 'Atmospheric AI Scientist' : 'District Meteorological Officer'),
      email: email,
      role: role,
      district: 'Erode'
    };
    onLoginSuccess(userData, 'skyguard_token_' + Date.now(), 'stations');
  };

  // 1-Click Instant Fast Login
  const handleFastLogin = (roleType, roleEmail, roleName, targetView = 'stations') => {
    setLoading(true);
    const userData = {
      name: roleName,
      email: roleEmail,
      role: roleType,
      district: 'Erode'
    };
    onLoginSuccess(userData, 'skyguard_token_' + Date.now(), targetView);
  };

  // 1-Click Direct Faulty Station 4 (Sathyamangalam Sensor Anomaly) Login
  const handleFaultyLogin4 = () => {
    setLoading(true);
    const userData = {
      name: 'District Meteorological Officer (Fault Triage)',
      email: 'officer@skyguard.tn.gov.in',
      role: 'officer',
      district: 'Erode'
    };
    onLoginSuccess(userData, 'skyguard_token_' + Date.now(), 'station_AWS_ERD_004');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '2rem auto 4rem auto', padding: '1rem' }}>
      
      {/* Top Controls: Back to Home + Fast Login Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBackToHome}
          className="btn btn-outline"
          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff' }}
        >
          <ArrowLeft size={16} /> Back to Welcome Page
        </button>

        {/* 1-Click Fast Login Shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleFastLogin('officer', 'officer@skyguard.tn.gov.in', 'District Meteorological Officer', 'stations')}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px' }}
          >
            <Zap size={15} /> ⚡ Fast Login (Instant)
          </button>

          <button
            onClick={handleFaultyLogin4}
            className="btn btn-danger"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px' }}
          >
            <Flame size={15} /> 🚨 Faulty Login (Station 4 Spike)
          </button>
        </div>
      </div>

      {/* Split-Screen Glass Panel */}
      <div className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        borderRadius: '28px',
        overflow: 'hidden',
        border: '1px solid rgba(2, 132, 199, 0.25)',
        background: '#ffffff',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(2, 132, 199, 0.06)'
      }}>
        
        {/* Left Side: Brand & Quick 1-Click Direct Login Roles */}
        <div style={{
          padding: '3rem 2.5rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
          borderRight: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.3)',
              marginBottom: '1.5rem'
            }}>
              <Shield size={32} color="#ffffff" strokeWidth={2.5} />
            </div>

            <div className="badge badge-cyan" style={{ marginBottom: '0.85rem' }}>
              <Radio size={12} className="pulse-active" /> SECURE METEOROLOGICAL DESK
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.85rem' }}>
              SKYGUARD Officer Command Console
            </h2>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Select any role below for <strong>instant 1-click access</strong> with pre-authenticated credentials, or login directly into faulty sensor test mode.
            </p>

            {/* 1-Click Direct Role Action Cards */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚡ Instant 1-Click Access Roles</span>
                <span style={{ color: 'var(--green-primary)', fontWeight: '700' }}>0ms Latency</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                
                {/* 1. Officer */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('officer', 'officer@skyguard.tn.gov.in', 'District Meteorological Officer')}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'space-between', padding: '0.65rem 0.9rem', fontSize: '0.8rem',
                    borderColor: 'rgba(2, 132, 199, 0.3)', background: 'var(--blue-light)', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={15} color="var(--blue-primary)" />
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>District Weather Officer</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Erode District AWS Array</div>
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>Login ➔</span>
                </button>

                {/* 2. Engineer */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('engineer', 'engineer@skyguard.tn.gov.in', 'Field AWS Maintenance Engineer')}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'space-between', padding: '0.65rem 0.9rem', fontSize: '0.8rem',
                    borderColor: 'rgba(16, 185, 129, 0.3)', background: 'var(--green-light)', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <KeyRound size={15} color="var(--green-primary)" />
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>Field Maintenance Engineer</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hardware Sensor Bus Triage</div>
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>Login ➔</span>
                </button>

                {/* 3. Scientist */}
                <button
                  type="button"
                  onClick={() => handleFastLogin('scientist', 'scientist@skyguard.tn.gov.in', 'Atmospheric AI Scientist')}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'space-between', padding: '0.65rem 0.9rem', fontSize: '0.8rem',
                    borderColor: '#c7d2fe', background: '#f5f3ff', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={15} color="#6366f1" />
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>Atmospheric AI Scientist</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ERA5 &amp; ML Consensus Models</div>
                    </div>
                  </div>
                  <span className="badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4f46e5' }}>Login ➔</span>
                </button>

                {/* 4. Special Faulty Station 4 Preset */}
                <button
                  type="button"
                  onClick={handleFaultyLogin4}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'space-between', padding: '0.65rem 0.9rem', fontSize: '0.8rem',
                    borderColor: 'rgba(239, 68, 68, 0.4)', background: 'var(--crimson-light)', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flame size={15} color="var(--crimson-primary)" />
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--crimson-primary)' }}>Faulty Station 4 Mode</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Sathyamangalam 48.4°C Spike Anomaly</div>
                    </div>
                  </div>
                  <span className="badge badge-red" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>🚨 Test Fault ➔</span>
                </button>

              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
            ISO/IEC 27001 Certified Meteorological Telemetry • Zero-Latency Authentication
          </div>
        </div>

        {/* Right Side: Direct Sign In Form */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
          
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>Officer Sign In</h3>
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Instant Auth</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Click any quick role on the left or press Enter below for instant access.
            </p>
          </div>

          {/* Instant Login Banner */}
          <div style={{
            background: 'var(--blue-light)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--blue-primary)', fontWeight: '700' }}>
              ⚡ Skip typing: One-Click Quick Sign In
            </div>
            <button
              type="button"
              onClick={() => handleFastLogin(role, email, 'District Meteorological Officer')}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              Sign In Now ➔
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                Officer ID / Official Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@skyguard.tn.gov.in"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                Security Access Token / Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Enter Command Center</span>
              <ArrowRight size={18} />
            </button>

          </form>

          {/* Switch to Register */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Need to register a new Field Station or Officer ID?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{ background: 'none', border: 'none', color: 'var(--blue-primary)', fontWeight: '800', cursor: 'pointer', padding: 0 }}
            >
              Register Officer Access
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

