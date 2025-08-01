import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icon for accused markers
const accusedIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #dc2626; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">⚠</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to fit map bounds to markers
const FitBounds = ({ markers }) => {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const validMarkers = markers.filter(marker => 
        marker.latitude && marker.longitude && 
        !isNaN(marker.latitude) && !isNaN(marker.longitude)
      );
      
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(
          validMarkers.map(marker => [marker.latitude, marker.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, markers]);

  return null;
};

const MapComponent = ({ accused = [], selectedAccused = null, onMarkerClick }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Filter accused with valid coordinates
  const validAccused = accused.filter(person => 
    person.latitude && person.longitude && 
    !isNaN(person.latitude) && !isNaN(person.longitude)
  );

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validAccused.map((person) => (
          <Marker
            key={person.accused_id}
            position={[person.latitude, person.longitude]}
            icon={accusedIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(person)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{person.full_name}</h3>
                
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Fraud Amount:</span>
                    <span className="ml-2 text-danger-600 font-semibold">
                      {formatCurrency(person.fraud_amount)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Case ID:</span>
                    <span className="ml-2">{person.case_id}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2">{person.phone_numbers?.join(', ')}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Police Station:</span>
                    <span className="ml-2">{person.police_station}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <div className="mt-1 text-gray-600">{person.address}</div>
                  </div>
                  
                  {person.tags && person.tags.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {person.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onMarkerClick && onMarkerClick(person)}
                  className="mt-3 w-full px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <FitBounds markers={validAccused} />
      </MapContainer>
      
      {validAccused.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-10">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations to display</h3>
            <p className="text-gray-600">No accused with valid coordinates found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;