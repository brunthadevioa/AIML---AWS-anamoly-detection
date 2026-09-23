import React, { useState, useEffect } from 'react';
import PublicNavbar from './components/PublicNavbar';
import OfficerCommandLayout from './components/OfficerCommandLayout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { buzzerService } from './services/buzzer';

export default function App() {
  // Page Routing: 'landing' | 'about' | 'login' | 'register' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('landing');
  
  // Dashboard Sub-View Routing: 'stations' | 'simulator' | 'analytics' | 'map' | 'alerts' | 'upload' | 'reports'
  const [dashboardView, setDashboardView] = useState('stations');

  const [user, setUser] = useState({
    name: 'District Meteorological Officer',
    email: 'officer@skyguard.tn.gov.in',
    role: 'officer',
    district: 'Erode',
  });
  
  const [isBuzzerActive, setIsBuzzerActive] = useState(false);
  const [alertCount, setAlertCount] = useState(1);

  const handleLoginSuccess = (userData, token, targetView = 'stations') => {
    setUser(userData);
    localStorage.setItem('skyguard_token', token);
    setCurrentPage('dashboard');
    setDashboardView(targetView);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('skyguard_token');
    buzzerService.stopBuzzer();
    setIsBuzzerActive(false);
    setCurrentPage('landing');
  };

  const handleSilenceBuzzer = () => {
    buzzerService.stopBuzzer();
    setIsBuzzerActive(false);
  };

  const handlePublicNavigate = (target) => {
    if (target === 'dashboard_overview') {
      setCurrentPage('dashboard');
      setDashboardView('stations');
    } else {
      setCurrentPage(target);
    }
  };

  // If inside Dashboard, render the dedicated Officer Command Center layout with pure Sidebar Navigation (NO TOP NAV)
  if (currentPage === 'dashboard') {
    return (
      <OfficerCommandLayout
        activeView={dashboardView}
        setActiveView={setDashboardView}
        user={user}
        onLogout={handleLogout}
        onBackToPublic={() => setCurrentPage('landing')}
        alertCount={alertCount}
        isBuzzerActive={isBuzzerActive}
        onSilenceBuzzer={handleSilenceBuzzer}
      >
        <DashboardPage
          activeTab={dashboardView}
          setActiveTab={setDashboardView}
        />
      </OfficerCommandLayout>
    );
  }

  // Otherwise, render the Public Portal with Public Header (Welcome, Login/Register top right) & Footer
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      
      {/* Public Navigation Bar */}
      <PublicNavbar
        currentPath={currentPage}
        onNavigate={handlePublicNavigate}
      />

      {/* Main Public Pages */}
      <main style={{ flex: 1, padding: '1rem 0' }}>
        {currentPage === 'landing' && (
          <LandingPage
            onEnterDashboard={() => {
              setCurrentPage('dashboard');
              setDashboardView('stations');
            }}
            onOpenLogin={() => setCurrentPage('login')}
            onOpenRegister={() => setCurrentPage('register')}
            onOpenAbout={() => setCurrentPage('about')}
            onOpenSandbox={() => {
              setCurrentPage('dashboard');
              setDashboardView('simulator');
            }}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onBack={() => setCurrentPage('landing')} />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentPage('register')}
            onBackToHome={() => setCurrentPage('landing')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setCurrentPage('login')}
            onBackToHome={() => setCurrentPage('landing')}
          />
        )}
      </main>

      {/* Public Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem 1.5rem', fontSize: '0.8rem',
        color: 'var(--text-muted)', borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <span>SKYGUARD — Precision Weather Anomaly &amp; Sensor Quality Platform</span>
            <span>•</span>
            <span>Tamil Nadu State Meteorological Telemetry Desk</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Erode District Physical AWS Array (5 Stations) • ECMWF ERA5 Atmospheric Reanalysis Baseline • Dual ML Core (Isolation Forest + LSTM)
          </div>
        </div>
      </footer>

    </div>
  );
}
