import React, { useState } from 'react';
import { Bell, CheckCircle, AlertOctagon, Volume2, ShieldAlert, Eye, Check } from 'lucide-react';
import { acknowledgeAlert } from '../services/api';
import { buzzerService } from '../services/buzzer';

export default function AlertCenter({ alerts = [], onAlertAcknowledged }) {
  const [filter, setFilter] = useState('active'); // 'active' | 'all'
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, 'District Weather Officer');
      buzzerService.stopBuzzer();
      if (onAlertAcknowledged) onAlertAcknowledged(alertId);
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.is_acknowledged;
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      
      {/* Header & Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--cyan-primary)" /> Incident & Sensor Alert Center
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time station telemetry breaches and officer acknowledgment logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '10px' }}>
          <button
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('active')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            Active Incidents ({alerts.filter(a => !a.is_acknowledged).length})
          </button>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            All Logs ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4>No Active Critical Alerts</h4>
          <p style={{ fontSize: '0.8rem' }}>All 5 Erode AWS stations are reporting within normal baseline tolerances.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredAlerts.map((alert) => {
            const isCritical = alert.alert_level === 'CRITICAL';
            return (
              <div 
                key={alert._id || alert.id || Math.random()}
                className={`glass-card ${isCritical && !alert.is_acknowledged ? 'critical-flash' : ''}`}
                style={{
                  borderLeft: isCritical ? '4px solid #ef4444' : '4px solid #f59e0b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isCritical ? '#f87171' : '#fbbf24'
                  }}>
                    {isCritical ? <AlertOctagon size={20} /> : <ShieldAlert size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{alert.station_name}</strong>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--cyan-primary)' }}>{alert.station_id}</span>
                      <span className={`badge ${isCritical ? 'badge-critical' : 'badge-warning'}`}>
                        {alert.type || 'SENSOR_FAULT'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!alert.is_acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alert._id || alert.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                    >
                      <Check size={14} /> Acknowledge & Silence
                    </button>
                  ) : (
                    <span className="badge badge-healthy" style={{ padding: '0.35rem 0.65rem' }}>
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
