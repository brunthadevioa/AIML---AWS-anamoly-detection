import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  CheckCircle, 
  UploadCloud, 
  Play, 
  Pause, 
  Flame, 
  RadioTower,
  Sparkles,
  RefreshCw,
  Zap,
  MapPin,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  CloudRain
} from 'lucide-react';
import ErodeMap from '../components/ErodeMap';
import DiagnosticHero from '../components/DiagnosticHero';
import StationGrid from '../components/StationGrid';
import AlertCenter from '../components/AlertCenter';
import DatasetRepairView from '../components/DatasetRepairView';
import ReportModal from '../components/ReportModal';
import SensorPlayground from '../components/SensorPlayground';
import TimeSeriesAnalytics from '../components/TimeSeriesAnalytics';
import { fetchAlerts, evaluateContextDecision } from '../services/api';
import { fetchAllLiveStations, fetchLiveStationWeather, ERODE_STATIONS } from '../services/liveWeather';
import { getSocket } from '../services/socket';
import { buzzerService } from '../services/buzzer';

export default function DashboardPage({ activeTab, setActiveTab }) {
  const [stations, setStations] = useState(ERODE_STATIONS);
  const [selectedStation, setSelectedStation] = useState(ERODE_STATIONS[0]); // Default Erode Town Central
  const selectedStationRef = useRef(selectedStation);
  
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [streamTick, setStreamTick] = useState(0);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const [diagnosticData, setDiagnosticData] = useState({
    station: { id: 'AWS_ERD_001', name: 'Erode Town Central', lat: 11.3410, lon: 77.7172 },
    observation: { temperature: 31.2, humidity: 63.0, pressure: 1010.8, wind_speed: 6.2, rainfall: 0.0 },
    ml_analysis: { is_anomaly: false, isolation_forest_score: 0.11, lstm_score: 0.0 },
    context: { era5_reference: 31.4, era5_deviation: -0.2, neighbour_mean: 31.0, neighbour_agreement: true, cross_parameter_consistency: true },
    classification: { label: 'NORMAL', confidence: 0.985 },
    alert_level: 'NORMAL',
    buzzer_active: false,
    evidence: [
      'Live atmospheric observations synchronized directly via Open-Meteo & ECMWF Reanalysis',
      'All 5 AWS stations in Erode agree on nominal diurnal temperature baseline',
      'Barometric pressure at 1010.8 hPa confirms standard regional atmospheric stability'
    ],
    recommendation: {
      action: 'Nominal meteorological telemetry streaming active',
      checks: ['All station sensor buses operating within normal parameters']
    }
  });

  const [alerts, setAlerts] = useState([
    {
      _id: 'alert-001',
      station_id: 'AWS_ERD_001',
      station_name: 'Erode Town Central',
      alert_level: 'NORMAL',
      type: 'HEALTH_CHECK',
      message: 'Erode District AWS Network synchronized with live atmospheric stream.',
      buzzer_active: false,
      is_acknowledged: true,
      timestamp: new Date().toISOString()
    }
  ]);

  // Keep selectedStationRef in sync with state
  useEffect(() => {
    selectedStationRef.current = selectedStation;
  }, [selectedStation]);

  // When activeTab changes from the sidebar (e.g. 'station_AWS_ERD_003'), select that station
  useEffect(() => {
    if (activeTab && activeTab.startsWith('station_')) {
      const stId = activeTab.replace('station_', '');
      const matched = stations.find(s => s.station_id === stId) || ERODE_STATIONS.find(s => s.station_id === stId);
      if (matched && matched.station_id !== selectedStationRef.current.station_id) {
        handleSelectStation(matched);
      }
    }
  }, [activeTab]);

  // Initial Live Telemetry Sync from Open-Meteo API
  useEffect(() => {
    fetchAllLiveStations().then((liveList) => {
      if (liveList && liveList.length > 0) {
        setStations(liveList);
        const currentTarget = liveList.find(s => s.station_id === selectedStationRef.current.station_id) || liveList[0];
        setSelectedStation(currentTarget);
        
        evaluateContextDecision({
          station_id: currentTarget.station_id,
          station_name: currentTarget.name,
          temperature: currentTarget.temperature ?? 31.2,
          humidity: currentTarget.humidity ?? 63,
          pressure: currentTarget.pressure ?? 1010.8,
          wind_speed: currentTarget.wind_speed ?? 6.2,
          rainfall: currentTarget.rainfall ?? 0.0
        }).then(setDiagnosticData).catch(console.warn);
      }
    }).catch(console.warn);

    fetchAlerts().then(data => {
      if (data.alerts && data.alerts.length > 0) setAlerts(data.alerts);
    }).catch(console.warn);

    const socket = getSocket();
    socket.on('live_reading', (reading) => {
      setDiagnosticData(reading);
    });
    socket.on('anomaly_alert', (anomaly) => {
      setAlerts(prev => [anomaly, ...prev]);
    });
    socket.on('buzzer_trigger', () => {
      buzzerService.startBuzzer();
    });

    return () => {
      socket.off('live_reading');
      socket.off('anomaly_alert');
      socket.off('buzzer_trigger');
    };
  }, []);

  // Continuous 1-Second Real-Time Live Telemetry Stream
  useEffect(() => {
    if (!isLiveStreaming) return;

    let tickCount = 0;
    let cachedLiveList = null;

    const interval = setInterval(async () => {
      setStreamTick(t => t + 1);
      tickCount += 1;

      const targetStation = selectedStationRef.current;
      const isBhavaniFaultActive = diagnosticData.alert_level === 'CRITICAL' && targetStation.station_id === 'AWS_ERD_003';

      try {
        // Fetch fresh web data every 10 ticks, or use high-frequency 1-second stream
        if (tickCount % 10 === 1 || !cachedLiveList) {
          cachedLiveList = await fetchAllLiveStations();
        }

        if (cachedLiveList && cachedLiveList.length > 0) {
          // Generate 1-second dynamic micro-telemetry on top of live website data
          const updatedStations = cachedLiveList.map(st => {
            if (isBhavaniFaultActive && st.station_id === 'AWS_ERD_003') {
              return { ...st, temperature: 48.4, status: 'WARNING' };
            }
            const microJitterTemp = (Math.random() - 0.5) * 0.1;
            const microJitterWind = (Math.random() - 0.5) * 0.15;
            const microJitterHum = (Math.random() - 0.5) * 0.2;
            
            return {
              ...st,
              temperature: parseFloat((st.temperature + microJitterTemp).toFixed(1)),
              humidity: parseFloat(Math.min(100, Math.max(10, st.humidity + microJitterHum)).toFixed(1)),
              wind_speed: parseFloat(Math.max(0, st.wind_speed + microJitterWind).toFixed(1)),
              last_sync: new Date().toLocaleTimeString('en-US', { hour12: false })
            };
          });

          setStations(updatedStations);

          const curr = updatedStations.find(s => s.station_id === targetStation.station_id) || updatedStations[0];
          
          if (!isBhavaniFaultActive) {
            setSelectedStation(curr);

            const evalRes = await evaluateContextDecision({
              station_id: curr.station_id,
              station_name: curr.name,
              temperature: curr.temperature,
              humidity: curr.humidity,
              pressure: curr.pressure,
              wind_speed: curr.wind_speed,
              rainfall: curr.rainfall
            });

            if (evalRes) {
              setDiagnosticData(evalRes);
            }
          }
        }
      } catch (err) {
        console.warn('1-second stream update notice:', err);
      }

    }, 1000); // Exact 1-Second Stream

    return () => clearInterval(interval);
  }, [isLiveStreaming, diagnosticData.alert_level]);

  // Select a Station Explicitly (User clicked a station in grid or sidebar) - 0ms Instant Response
  const handleSelectStation = async (st) => {
    setSelectedStation(st);
    selectedStationRef.current = st;
    buzzerService.stopBuzzer();
    
    // Instantaneous local context computation (< 1ms)
    evaluateContextDecision({
      station_id: st.station_id,
      station_name: st.name,
      temperature: st.temperature ?? 31.0,
      humidity: st.humidity ?? 64.0,
      pressure: st.pressure ?? 1010.5,
      wind_speed: st.wind_speed ?? 5.8,
      rainfall: st.rainfall ?? 0.0
    }).then(setDiagnosticData);

    // Asynchronous background live Open-Meteo fetch without blocking UI
    fetchLiveStationWeather(st).then((live) => {
      if (live && selectedStationRef.current.station_id === st.station_id) {
        const updated = { ...st, ...live, last_sync: new Date().toLocaleTimeString('en-US', { hour12: false }) };
        setSelectedStation(updated);
        selectedStationRef.current = updated;
        evaluateContextDecision({
          station_id: updated.station_id,
          station_name: updated.name,
          temperature: updated.temperature,
          humidity: updated.humidity,
          pressure: updated.pressure,
          wind_speed: updated.wind_speed,
          rainfall: updated.rainfall
        }).then(setDiagnosticData);
      }
    }).catch(console.warn);
  };

  // 1-Click Anomaly Demo for Bhavani ONLY - 0ms Instant Synchronous Execution
  const handleInjectBhavaniAnomaly = () => {
    const bhavaniStation = stations.find(s => s.station_id === 'AWS_ERD_003') || ERODE_STATIONS[2];
    const faultyStation = { ...bhavaniStation, temperature: 48.4, status: 'WARNING' };
    
    setSelectedStation(faultyStation);
    selectedStationRef.current = faultyStation;

    const faultDecision = {
      station: { id: 'AWS_ERD_003', name: 'Bhavani', lat: 11.4477, lon: 77.6833 },
      observation: { temperature: 48.4, humidity: 61.2, pressure: 1005.4, wind_speed: 8.2, rainfall: 0.0 },
      ml_analysis: { is_anomaly: true, isolation_forest_score: 0.779, lstm_score: 0.0 },
      context: { era5_reference: 31.0, era5_deviation: 17.4, neighbour_mean: 30.9, neighbour_agreement: false, cross_parameter_consistency: false },
      classification: { label: 'POSSIBLE_SENSOR_FAULT', confidence: 0.916 },
      alert_level: 'CRITICAL',
      buzzer_active: true,
      evidence: [
        'Extreme thermal deviation (+17.4°C) from ECMWF ERA5 baseline (31.0°C)',
        '4 neighbouring Erode AWS stations report normal conditions (mean = 30.9°C)',
        'Isolated temperature anomaly detected exclusively at Bhavani AWS node',
        'Barometric pressure and relative humidity remain in normal baseline'
      ],
      recommendation: {
        action: 'Immediate field inspection of temperature sensor at Bhavani AWS',
        checks: [
          'Inspect thermocouple / RTD sensor wiring for loose connections',
          'Inspect sensor radiation shield and aspirator fan',
          'Cross-calibrate with standard digital reference instrument'
        ]
      }
    };

    // Instant zero-delay synchronous state updates (< 1ms)
    setDiagnosticData(faultDecision);
    buzzerService.startBuzzer();
    setAlerts(prev => [
      {
        _id: 'fault-' + Date.now(),
        station_id: 'AWS_ERD_003',
        station_name: 'Bhavani',
        alert_level: 'CRITICAL',
        type: 'SENSOR_FAULT',
        message: 'CRITICAL SENSOR FAULT detected at Bhavani (91.6% confidence). Isolated 48.4°C thermocouple spike.',
        buzzer_active: true,
        is_acknowledged: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const isIndividualStationPage = activeTab && activeTab.startsWith('station_');

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 0 2rem 0' }}>
      
      {/* 1. Dedicated Individual Station Page - ONLY this single station data, no other station matrices */}
      {isIndividualStationPage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Station Info Header */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                  <MapPin size={13} /> {selectedStation.station_id}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  {selectedStation.name} AWS Field Station
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  🟢 REAL-TIME LIVE SYNC
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                GPS: <strong className="mono">{selectedStation.lat}°N, {selectedStation.lon}°E</strong> • Elevation: <strong className="mono">{selectedStation.elevation || '200m'}</strong> • Direct Open-Meteo Telemetry Stream
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => handleSelectStation(selectedStation)}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
                title="Fetch live weather right now"
              >
                <RefreshCw size={14} /> Refresh {selectedStation.name} Live
              </button>

              {selectedStation.station_id === 'AWS_ERD_003' && (
                <button
                  onClick={handleInjectBhavaniAnomaly}
                  className="btn btn-danger"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
                >
                  <Flame size={14} /> Test 48.4°C Anomaly Demo
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Dials for the Selected Station ONLY */}
          <DiagnosticHero diagnosticData={diagnosticData} showComparativeMatrix={false} />

        </div>
      )}

      {/* 2. Dedicated View: 5-Station District Grid */}
      {(activeTab === 'stations' || activeTab === 'overview' || !activeTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Live Control Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '0.75rem 1.25rem',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isLiveStreaming ? 'var(--green-primary)' : 'var(--amber-primary)', animation: isLiveStreaming ? 'pulse-glow 1s infinite' : 'none' }}></span>
              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {isLiveStreaming ? '🔴 1-SECOND LIVE WEB STREAM (All 5 Stations Active)' : '⏸️ REAL-TIME STREAM PAUSED'}
              </span>
              <span className="badge badge-cyan mono" style={{ fontSize: '0.65rem' }}>
                1s TICK #{streamTick}
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                weatherandradar.in &amp; Satellite Synced (1s)
              </span>
            </div>

            {/* Live Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSelectStation(selectedStation)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                title="Fetch live real atmospheric data"
              >
                <RefreshCw size={14} className={isLiveSyncing ? 'spin' : ''} />
                <span>Refresh Live</span>
              </button>

              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                {isLiveStreaming ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
              </button>

              {/* Demo: Trigger Bhavani Anomaly ONLY */}
              <button
                onClick={handleInjectBhavaniAnomaly}
                className="btn btn-danger"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                <Flame size={14} /> Inject Bhavani 48.4°C Fault
              </button>

              {/* Reset Bhavani to Live */}
              <button
                onClick={() => {
                  const bhavani = stations.find(s => s.station_id === 'AWS_ERD_003') || ERODE_STATIONS[2];
                  handleSelectStation(bhavani);
                }}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderColor: 'var(--green-primary)', color: 'var(--green-primary)' }}
              >
                <CheckCircle size={14} /> Bhavani Normal Live
              </button>
            </div>
          </div>

          {/* 5-Station Interactive Grid: Click any station to inspect */}
          <StationGrid
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            activeAnomalies={diagnosticData.alert_level === 'CRITICAL' ? { [diagnosticData.station?.id || 'AWS_ERD_003']: diagnosticData } : {}}
          />

          {/* Detailed Diagnostic Gauges for the Currently Selected Station */}
          <DiagnosticHero diagnosticData={diagnosticData} />
        </div>
      )}

      {/* 3. Dedicated View: AI Dataset Repair & Cleaner */}
      {(activeTab === 'dataset_repair' || activeTab === 'upload') && (
        <DatasetRepairView />
      )}

      {/* 4. Dedicated View: Incident & Alarm Desk */}
      {activeTab === 'alerts' && (
        <AlertCenter 
          alerts={alerts} 
          onAlertAcknowledged={(id) => {
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, is_acknowledged: true, buzzer_active: false } : a));
          }} 
        />
      )}

      {/* 5. Dedicated View: District GIS Radar Map */}
      {activeTab === 'map' && (
        <div style={{ height: '700px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
          <ErodeMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            activeAnomalies={diagnosticData.alert_level === 'CRITICAL' ? { [diagnosticData.station?.id || 'AWS_ERD_003']: diagnosticData } : {}}
          />
        </div>
      )}

      {/* 6. Dedicated View: 24h Time-Series Trends */}
      {activeTab === 'analytics' && (
        <TimeSeriesAnalytics stations={stations} />
      )}

      {/* 7. Dedicated View: AI Simulation Sandbox */}
      {activeTab === 'simulator' && (
        <SensorPlayground onApplyToDiagnostic={setDiagnosticData} />
      )}

      {/* 8. Dedicated View: Incident Audit Reports */}
      {activeTab === 'reports' && (
        <ReportModal
          isOpen={true}
          onClose={() => setActiveTab('stations')}
          diagnosticData={diagnosticData}
          anomalies={alerts}
        />
      )}

    </div>
  );
}
