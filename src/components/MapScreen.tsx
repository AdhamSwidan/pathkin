import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Post } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface MapScreenProps {
  postsToShow: Post[];
}

const MapScreen: React.FC<MapScreenProps> = ({ postsToShow }) => {
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


  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    // Use a variable to hold the map instance for cleanup
    let map = mapInstanceRef.current;

    // If map is not initialized, create it
    if (!map) {
      const firstPostWithCoords = postsToShow.find(p => p.coordinates);
      const centerLat = firstPostWithCoords?.coordinates?.lat ?? 51.505; // Default to London
      const centerLng = firstPostWithCoords?.coordinates?.lng ?? -0.09;
      const zoom = firstPostWithCoords ? 10 : 2;

      map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
    
    // Layer to hold markers, so we can clear it easily
    const markerLayer = L.layerGroup().addTo(map);

    // Add markers for each post
    const markers: L.Marker[] = [];
    postsToShow.forEach(post => {
      if (post.coordinates) {
        const marker = L.marker([post.coordinates.lat, post.coordinates.lng])
          .bindPopup(`<b>${post.title}</b><br>${post.location}`);
        markerLayer.addLayer(marker);
        markers.push(marker);
      }
    });

    // Fit map to markers if there are any
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }


    // Cleanup function: remove the markers layer when the component unmounts or postsToShow change.
    return () => {
      markerLayer.clearLayers();
    };
  }, [postsToShow]); // Re-run effect when postsToShow change

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