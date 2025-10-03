import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Adventure } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';
import MyLocationIcon from './icons/MyLocationIcon';

interface MapScreenProps {
  adventuresToShow: Adventure[];
  isLoaded: boolean;
  onShowToast: (message: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapScreen: React.FC<MapScreenProps> = ({ adventuresToShow, isLoaded, onShowToast }) => {
  const { t } = useTranslation();
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [myPosition, setMyPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const firstAdventureWithCoords = adventuresToShow.find(p => p.coordinates);
  const center = {
    lat: firstAdventureWithCoords?.coordinates?.lat ?? 51.505,
    lng: firstAdventureWithCoords?.coordinates?.lng ?? -0.09,
  };

  const onMarkerClick = (adventure: Adventure) => {
    setSelectedAdventure(adventure);
  };
  
  const onInfoWindowClose = () => {
    setSelectedAdventure(null);
  }

  const handleShowMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMyPosition(pos);
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(14);
        },
        () => {
          onShowToast(t('locationPermissionDenied'));
        }
      );
    } else {
      onShowToast(t('locationUnavailable'));
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header title={t('mapView')} />
      <div className="w-full flex-grow relative">
        {isLoaded ? (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={firstAdventureWithCoords ? 10 : 2}
              onLoad={onMapLoad}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {adventuresToShow.map(adventure => (
                adventure.coordinates && (
                  <MarkerF
                    key={adventure.id}
                    position={adventure.coordinates}
                    onClick={() => onMarkerClick(adventure)}
                  />
                )
              ))}

              {myPosition && (
                <MarkerF
                  position={myPosition}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  }}
                />
              )}

              {selectedAdventure && selectedAdventure.coordinates && (
                <InfoWindowF
                  position={selectedAdventure.coordinates}
                  onCloseClick={onInfoWindowClose}
                >
                  <div className="p-1">
                    <h3 className="font-bold text-gray-800">{selectedAdventure.title}</h3>
                    <p className="text-sm text-gray-600">{selectedAdventure.location}</p>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
            <button
              onClick={handleShowMyLocation}
              className="absolute bottom-4 end-4 z-10 bg-white dark:bg-neutral-800 p-3 rounded-full shadow-lg"
              aria-label={t('showMyLocation')}
            >
              <MyLocationIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MapScreen);