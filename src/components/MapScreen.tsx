import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Adventure } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface MapScreenProps {
  adventuresToShow: Adventure[];
  language: string;
}

const MapScreen: React.FC<MapScreenProps> = ({ adventuresToShow, language }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null); // To store the map instance
  const { t } = useTranslation();

  // This effect runs once on mount to configure the leaflet icons.
  // It uses absolute CDN URLs to avoid build path conflicts with the import map.
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const formatLocation = (data: any) => {
    const { address } = data;
    if (!address) return data.display_name.split(',').slice(0, 3).join(', ');;
    const parts = [
      address.city || address.town || address.village || address.suburb || address.county,
      address.state,
      address.country
    ];
    return parts.filter(Boolean).join(', ');
  }


  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    // Use a variable to hold the map instance for cleanup
    let map = mapInstanceRef.current;

    // If map is not initialized, create it
    if (!map) {
      const firstAdventureWithCoords = adventuresToShow.find(p => p.coordinates);
      const centerLat = firstAdventureWithCoords?.coordinates?.lat ?? 51.505; // Default to London
      const centerLng = firstAdventureWithCoords?.coordinates?.lng ?? -0.09;
      const zoom = firstAdventureWithCoords ? 10 : 2;

      map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
    
    // Layer to hold markers, so we can clear it easily
    const markerLayer = L.layerGroup().addTo(map);

    const addMarkers = async () => {
        const markers: L.Marker[] = [];
        for (const adventure of adventuresToShow) {
            if (adventure.coordinates) {
                let locationName = adventure.location; // Fallback to the stored name
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${adventure.coordinates.lat}&lon=${adventure.coordinates.lng}&accept-language=${language}&zoom=10`);
                    const data = await response.json();
                    if (data) {
                        locationName = formatLocation(data);
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                }

                const marker = L.marker([adventure.coordinates.lat, adventure.coordinates.lng])
                .bindPopup(`<b>${adventure.title}</b><br>${locationName}`);
                markerLayer.addLayer(marker);
                markers.push(marker);
            }
        }

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    };

    addMarkers();

    // Cleanup function: remove the markers layer when the component unmounts or adventuresToShow change.
    return () => {
      markerLayer.clearLayers();
    };
  }, [adventuresToShow, language]); // Re-run effect when adventures or language change

  // Separate effect for map removal on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <Header title={t('mapView')} />
      <div 
        ref={mapContainerRef} 
        id="map" 
        className="w-full flex-grow"
      >
      </div>
    </div>
  );
};

export default MapScreen;