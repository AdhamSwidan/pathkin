import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Adventure } from '../types';
import Header from './Header';
import { useTranslation } from '../contexts/LanguageContext';

interface MapScreenProps {
  adventuresToShow: Adventure[];
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapScreen: React.FC<MapScreenProps> = ({ adventuresToShow }) => {
  const { t } = useTranslation();
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);

  const firstAdventureWithCoords = adventuresToShow.find(p => p.coordinates);
  const center = {
    lat: firstAdventureWithCoords?.coordinates?.lat ?? 51.505,
    lng: firstAdventureWithCoords?.coordinates?.lng ?? -0.09,
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const onMarkerClick = (adventure: Adventure) => {
    setSelectedAdventure(adventure);
  };
  
  const onInfoWindowClose = () => {
    setSelectedAdventure(null);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Header title={t('mapView')} />
      <div className="w-full flex-grow">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={firstAdventureWithCoords ? 10 : 2}
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