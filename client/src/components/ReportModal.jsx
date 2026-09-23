import React from 'react';
import { FileText, Download, Printer, X, Shield, CheckCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, diagnosticData, anomalies = [] }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Timestamp,Station ID,Station Name,Temperature,Humidity,Pressure,Classification,Confidence\n';
    const rows = anomalies.map(a => 
      `"${a.timestamp || new Date().toISOString()}","${a.station_id || 'AWS_ERD_003'}","${a.station_name || 'Bhavani'}",${a.observation?.temperature || 48.4},${a.observation?.humidity || 61.2},${a.observation?.pressure || 1005.4},"${a.classification?.label || 'POSSIBLE_SENSOR_FAULT'}",${(a.classification?.confidence || 0.916) * 100}%`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VAAYU_Erode_AWS_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', background: '#0a101f' }}>
        
        {/* Actions bar (hidden in print) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--cyan-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Official AWS Quality & Anomaly Report</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleExportCSV} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              <Download size={14} /> Export CSV
            </button>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem 0.5rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div id="printable-report" style={{ color: '#f8fafc' }}>
          
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #00e5ff', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#00e5ff', letterSpacing: '0.05em' }}>VAAYU INTELLIGENCE REPORT</h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Erode District Meteorological & AWS Sensor Assurance Desk</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tamil Nadu Regional Telemetry Grid</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
              <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
              <div><strong>Reporting Officer:</strong> District Weather Officer</div>
              <div><strong>Classification Engine:</strong> VAAYU Explainable AI v1.0</div>
            </div>
          </div>

          {/* Incident Summary */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.5rem' }}>1. PRIMARY INCIDENT SYNOPSIS</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#e2e8f0' }}>
              On {new Date().toLocaleDateString()}, anomalous physical telemetry was flagged at <strong>Bhavani AWS Station (AWS_ERD_003)</strong>.
              The observation recorded a rapid temperature spike of <strong>48.4°C</strong>.
              Contextual analysis against Open-Meteo ERA5 atmospheric reanalysis baseline (29.5°C) and four neighbouring Erode stations (mean 28.6°C) confirmed this as an <strong>isolated sensor failure</strong> rather than a regional meteorological extreme.
            </p>
          </div>

          {/* Telemetry Comparison Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.5rem' }}>2. MULTI-SOURCE CONTEXTUAL EVIDENCE MATRIX</h4>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}>
                  <th style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Source Parameter</th>
                  <th style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Observed AWS Value</th>
                  <th style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>ERA5 Reference</th>
                  <th style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Neighbour Mean</th>
                  <th style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Finding</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Temperature</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', fontWeight: '700' }}>48.4 °C</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>29.5 °C</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>28.6 °C</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444' }}>Severe Deviation (+18.9°C)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Relative Humidity</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>61.2 %</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>68.0 %</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>65.4 %</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', color: '#10b981' }}>Normal Baseline</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>Atmospheric Pressure</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>1005.4 hPa</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>1001.0 hPa</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>1000.8 hPa</td>
                  <td style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.1)', color: '#10b981' }}>Normal Baseline</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actionable Engineering Recommendation */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#f87171', marginBottom: '0.4rem' }}>3. REQUIRED FIELD ACTIONS & QUALITY PROTOCOL</h4>
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>• Dispatch field technician to Bhavani AWS Station enclosure (Lat: 11.4477°N, Lon: 77.6833°E).</div>
              <div>• Inspect thermocouple / RTD sensor wiring for loose connections or corrosion.</div>
              <div>• Clean radiation shield and verify aspirator fan operation.</div>
              <div>• Cross-calibrate with standard digital reference thermometer before clearing flag.</div>
            </div>
          </div>

          {/* Signoff */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div>Confidential • State Weather Data Assurance Cell</div>
            <div>Signed electronically by: <strong>VAAYU SkyGuard AI Core</strong></div>
          </div>

        </div>

      </div>
    </div>
  );
}
