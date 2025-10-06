
import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, MarkerF, StandaloneSearchBox } from '@react-google-maps/api';
import { useTranslation } from '../contexts/LanguageContext';
import MyLocationIcon from './icons/MyLocationIcon';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 51.5072,
  lng: -0.1276, // London
};

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose, onLocationSelect, initialPosition }) => {
  const { t } = useTranslation();
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(initialPosition || null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (initialPosition) {
        map.panTo(initialPosition);
    }
  }, [initialPosition]);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);
  
  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0 && places[0].geometry?.location) {
      const location = places[0].geometry.location;
      const newPos = { lat: location.lat(), lng: location.lng() };
      setMarkerPosition(newPos);
      mapRef.current?.panTo(newPos);
      mapRef.current?.setZoom(15);
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);
  
  const handleConfirm = () => {
    if (!markerPosition) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: markerPosition }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
            onLocationSelect(results[0].formatted_address, markerPosition);
        } else {
            console.error('Geocoder failed due to: ' + status);
            alert(t('noAddressFound'))
        }
    });
  };
  
  const handleShowMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(pos);
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(15);
        },
        () => {
          alert(t('locationPermissionDenied'));
        }
      );
    } else {
      alert(t('locationUnavailable'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[102] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">{t('selectOnMap')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <div className="flex-grow relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={initialPosition || defaultCenter}
                zoom={initialPosition ? 15 : 8}
                onLoad={onMapLoad}
                onClick={onMapClick}
            >
                {markerPosition && <MarkerF position={markerPosition} />}
            </GoogleMap>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
                 <StandaloneSearchBox
                    onLoad={onSearchBoxLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <input
                        type="text"
                        placeholder={t('searchForLocation')}
                        className="w-full p-3 rounded-md shadow-lg border-none focus:ring-2 focus:ring-orange-500"
                    />
                </StandaloneSearchBox>
            </div>
             <button
              onClick={handleShowMyLocation}
              className="absolute bottom-4 end-4 z-10 bg-white dark:bg-zinc-800 p-3 rounded-full shadow-lg"
              aria-label={t('showMyLocation')}
            >
              <MyLocationIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
        </div>
        
        <div className="p-4 border-t dark:border-neutral-800">
          <button onClick={handleConfirm} disabled={!markerPosition} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 disabled:bg-orange-300 transition-colors">
            {t('confirmLocation')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;