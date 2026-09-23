import React from 'react';
import { ArrowLeft, Cpu, Database, Server, Radio, Shield, CheckCircle2, Layers, Compass } from 'lucide-react';

export default function AboutPage({ onBack }) {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      <button onClick={onBack} className="btn btn-outline" style={{ marginBottom: '1.5rem', padding: '0.45rem 1rem', background: '#ffffff' }}>
        <ArrowLeft size={16} /> Back to Welcome Page
      </button>

      <div className="glass-panel" style={{ padding: '2.75rem', marginBottom: '2rem', background: '#ffffff', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '28px', boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)' }}>
        
        <div className="badge badge-cyan" style={{ marginBottom: '0.85rem' }}>Scientific &amp; Technical Foundation</div>
        
        <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          About SKYGUARD AI Architecture
        </h1>
        
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2rem' }}>
          Automated Weather Stations (AWS) are critical for disaster warning, emergency response, and agricultural protection. 
          However, harsh environmental exposure causes hardware sensors to experience calibration drift, stuck values, and extreme thermocouple spikes. 
          SKYGUARD solves the critical challenge of definitively distinguishing true natural extreme weather events from sensor hardware failures.
        </p>

        {/* Technical Grounding Callout */}
        <div style={{ background: 'var(--blue-light)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--blue-primary)', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Grounded Physical Reference Architecture
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>1. ECMWF ERA5 Atmospheric Baseline:</strong> Reanalysis and numerical weather prediction models provide an objective, macro-environmental ground truth independent of on-site hardware degradation.<br />
            <strong>2. Physical Sensor Telemetry:</strong> High-frequency observations recorded on-site across Erode, Bhavani, Gobichettipalayam, Sathyamangalam, and Perundurai stations.
          </p>
        </div>

        {/* 3-Tier Pipeline Architecture */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          The 3-Tier Decision &amp; Imputation Pipeline
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--blue-primary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Tier 1 • Rapid Outlier Triage
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Isolation Forest &amp; Temporal Models
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Evaluates incoming sensor streams in under 4ms. Identifies statistical outliers, sudden hardware spikes, and flatline frozen readings.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--green-primary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Tier 2 • Spatial Consensus
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Regional AWS Network Voting
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Queries adjacent AWS stations in Erode District. If neighboring stations experience the same atmospheric transition, it confirms a genuine weather front rather than an isolated hardware failure.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Tier 3 • Physical Consistency
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Cross-Parameter Physics &amp; Auto-Imputation
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enforces physical laws (e.g. convective precipitation correlates with barometric drops and temperature reduction). Replaces defective records with validated imputed values.
            </p>
          </div>

        </div>

        {/* Erode AWS Network Table */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          Erode District AWS Network Coverage
        </h2>

        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <table style={{ width: '100%', fontSize: '0.88rem', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: 'var(--text-secondary)', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Station ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Station Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Coordinates</th>
                <th style={{ padding: '0.85rem 1rem' }}>Elevation &amp; Microclimate</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                <td className="mono" style={{ padding: '0.85rem 1rem', color: 'var(--blue-primary)', fontWeight: '700' }}>AWS_ERD_001</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Erode Town Central</td>
                <td style={{ padding: '0.85rem 1rem' }}>11.3410°N, 77.7172°E</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>183m • Urban Basin</td>
              </tr>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                <td className="mono" style={{ padding: '0.85rem 1rem', color: 'var(--blue-primary)', fontWeight: '700' }}>AWS_ERD_002</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Gobichettipalayam</td>
                <td style={{ padding: '0.85rem 1rem' }}>11.4551°N, 77.4366°E</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>213m • Agricultural Canal Zone</td>
              </tr>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                <td className="mono" style={{ padding: '0.85rem 1rem', color: 'var(--blue-primary)', fontWeight: '700' }}>AWS_ERD_003</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Bhavani</td>
                <td style={{ padding: '0.85rem 1rem' }}>11.4477°N, 77.6833°E</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>162m • River Confluence Plain</td>
              </tr>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                <td className="mono" style={{ padding: '0.85rem 1rem', color: 'var(--blue-primary)', fontWeight: '700' }}>AWS_ERD_004</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Sathyamangalam</td>
                <td style={{ padding: '0.85rem 1rem' }}>11.5052°N, 77.2388°E</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>229m • Forest Foothills Corridor</td>
              </tr>
              <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                <td className="mono" style={{ padding: '0.85rem 1rem', color: 'var(--blue-primary)', fontWeight: '700' }}>AWS_ERD_005</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '700' }}>Perundurai</td>
                <td style={{ padding: '0.85rem 1rem' }}>11.2744°N, 77.5831°E</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>292m • Industrial &amp; Transit Corridor</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
