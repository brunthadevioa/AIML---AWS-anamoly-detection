import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Radio, Wind, Layers } from 'lucide-react';

// Custom pulsing SVG markers for Control Room Theme
const createStationIcon = (status) => {
  let color = '#10b981'; // Green
  let glow = 'rgba(16, 185, 129, 0.6)';

  if (status === 'CRITICAL' || status === 'WARNING_FAULT') {
    color = '#ef4444'; // Red
    glow = 'rgba(239, 68, 68, 0.8)';
  } else if (status === 'WEATHER_EVENT') {
    color = '#f59e0b'; // Amber
    glow = 'rgba(245, 158, 11, 0.7)';
  }

  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${glow}; animation: pulse-ring 2s infinite;"></div>
      <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 3px solid #070b14; box-shadow: 0 0 10px ${color}; z-index: 2;"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-station-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
};

export default function ErodeMap({ stations, selectedStation, onSelectStation, activeAnomalies = {} }) {
  const [mapSource, setMapSource] = useState('gis'); // 'gis' | 'windy'
  const [windyOverlay, setWindyOverlay] = useState('temp'); // 'temp' | 'wind' | 'rain' | 'clouds'
  
  const currentLat = selectedStation?.lat || 11.3410;
  const currentLon = selectedStation?.lon || 77.7172;
  const erodeCenter = [11.37, 77.55]; // District centroid

  const windyEmbedUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=10&overlay=${windyOverlay}&product=ecmwf&level=surface&lat=${currentLat}&lon=${currentLon}&detailLat=${currentLat}&detailLon=${currentLon}&marker=true`;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative', height: '100%', minHeight: '520px', background: '#ffffff' }}>
      
      {/* Top Header & Map Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛰️ Erode District Atmospheric GIS &amp; Windy.com Radar
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time physical AWS station spatial consensus synchronized with <strong>Windy.com (ECMWF ERA5)</strong>
          </p>
        </div>

        {/* Source Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setMapSource('gis')}
              className={`btn ${mapSource === 'gis' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderRadius: '7px' }}
            >
              <Radio size={13} /> AWS Sensor Pins
            </button>
            <button
              onClick={() => setMapSource('windy')}
              className={`btn ${mapSource === 'windy' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderRadius: '7px' }}
            >
              <Wind size={13} /> 🌪️ Live Radar Stream
            </button>
          </div>

          {mapSource === 'windy' && (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setWindyOverlay('temp')}
                className={`btn ${windyOverlay === 'temp' ? 'btn-danger' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
              >
                🌡️ Temp
              </button>
              <button
                onClick={() => setWindyOverlay('wind')}
                className={`btn ${windyOverlay === 'wind' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
              >
                💨 Wind
              </button>
              <button
                onClick={() => setWindyOverlay('rain')}
                className={`btn ${windyOverlay === 'rain' ? 'btn-cyan' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
              >
                🌧️ Rain
              </button>
            </div>
          )}

          {selectedStation && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <a
                href={selectedStation.weather_and_radar_url || 'https://www.weatherandradar.in/weather-radar'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', borderColor: '#059669', background: '#f0fdf4' }}
              >
                📡 weatherandradar.in Live <ExternalLink size={12} />
              </a>

              <a
                href={selectedStation.windy_url || `https://www.windy.com/${currentLat}/${currentLon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-primary)', borderColor: 'var(--blue-primary)' }}
              >
                Windy.com <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Map View Area */}
      <div style={{ height: '440px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        
        {mapSource === 'windy' ? (
          <iframe
            src={windyEmbedUrl}
            title="Windy.com Real-time Atmospheric Telemetry"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 'none', width: '100%', height: '100%' }}
          />
        ) : (
          <MapContainer center={erodeCenter} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            {/* Clean CartoDB Voyager tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://weatherandradar.in">Weather & Radar</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {stations.map((st) => {
              const hasAnomaly = activeAnomalies[st.station_id];
              let status = 'NORMAL';
              if (hasAnomaly) {
                status = hasAnomaly.classification?.label === 'POSSIBLE_SENSOR_FAULT' ? 'CRITICAL' : 'WEATHER_EVENT';
              } else if (st.station_id === 'AWS_ERD_003' && selectedStation?.station_id === 'AWS_ERD_003' && selectedStation?.temperature > 40) {
                status = 'CRITICAL';
              }

              const isSelected = selectedStation?.station_id === st.station_id;

              return (
                <React.Fragment key={st.station_id}>
                  {isSelected && (
                    <Circle
                      center={[st.lat, st.lon]}
                      radius={3500}
                      pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.15, weight: 2, dashArray: '4, 4' }}
                    />
                  )}
                  <Marker
                    position={[st.lat, st.lon]}
                    icon={createStationIcon(status)}
                    eventHandlers={{
                      click: () => onSelectStation(st),
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: '220px', padding: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{st.name}</strong>
                          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--blue-primary)', fontWeight: '800' }}>{st.station_id}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          Lat: {st.lat.toFixed(4)}°N • Lon: {st.lon.toFixed(4)}°E
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', background: '#f8fafc', padding: '0.45rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '0.6rem', border: '1px solid #e2e8f0' }}>
                          <div>Temp: <strong style={{ color: status === 'CRITICAL' ? 'var(--crimson-primary)' : '#0f172a' }}>{st.temperature ?? 31.0}°C</strong></div>
                          <div>Humidity: <strong>{st.humidity ?? 64}%</strong></div>
                          <div>Pressure: <strong>{st.pressure ?? 1010.5} hPa</strong></div>
                          <div>Wind: <strong>{st.wind_speed ?? 5.8} km/h</strong></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => onSelectStation(st)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem' }}
                          >
                            🔬 Open AI Diagnostic
                          </button>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <a
                              href={st.weather_and_radar_url || 'https://www.weatherandradar.in/weather-radar'}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              weatherandradar.in ↗
                            </a>
                            <a
                              href={st.windy_url || `https://www.windy.com/${st.lat}/${st.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.7rem', color: 'var(--blue-primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              Windy.com ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        )}

      </div>
    </div>
  );
}

