import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MilitaryOSMLayer from './MilitaryLayer';

function App() {
  const centerPosition = [52.069, 19.48]; 

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0 }}>
      <MapContainer 
        center={centerPosition} 
        zoom={6} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          // Zmień na "/tiles/{z}/{x}/{y}.png" dla pełnego offline bez internetu
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MilitaryOSMLayer />
      </MapContainer>
    </div>
  );
}

export default App;