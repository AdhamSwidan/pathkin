import React, { useEffect, useRef } from 'react';
import { Post } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

// Declaring the Leaflet global 'L' to avoid TypeScript errors.
declare const L: any;

interface MapScreenProps {
  postsToShow: Post[];
}

const MapScreen: React.FC<MapScreenProps> = ({ postsToShow }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null); // To store the map instance
  const { t } = useTranslation();

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') {
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
    const markers: any[] = [];
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
        {typeof L === 'undefined' && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading map library...
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;