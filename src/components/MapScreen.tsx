import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, DirectionsRenderer } from '@react-google-maps/api';
import { HydratedAdventure, AdventureType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import MyLocationIcon from './icons/MyLocationIcon';
import { getAdventureIconDataUrl } from '../utils/mapIconUtils';
import HikingIcon from './icons/HikingIcon';
import TentIcon from './icons/TentIcon';
import BicycleIcon from './icons/BicycleIcon';
import PlaneIcon from './icons/PlaneIcon';
import HeartIcon from './icons/HeartIcon';
import GroupIcon from './icons/GroupIcon';
import GridIcon from './icons/GridIcon';


interface MapScreenProps {
  adventuresToShow: HydratedAdventure[];
  isLoaded: boolean;
  onShowToast: (message: string) => void;
  onSelectAdventure: (adventure: HydratedAdventure) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Filter button component
const FilterButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-colors duration-200 ${
            isActive 
            ? 'bg-brand-orange/10 dark:bg-brand-orange/20' 
            : 'bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-slate-100 dark:hover:bg-zinc-700/50'
        }`}
    >
        <div className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400'}`}>
            {icon}
        </div>
        <span className={`text-xs mt-1 text-center ${isActive ? 'font-semibold text-brand-orange dark:text-brand-orange-light' : 'text-gray-600 dark:text-gray-300'}`}>
            {label}
        </span>
    </button>
);


const MapScreen: React.FC<MapScreenProps> = ({ adventuresToShow, isLoaded, onShowToast, onSelectAdventure }) => {
  const { t, language } = useTranslation();
  const [selectedLocalAdventure, setSelectedLocalAdventure] = useState<HydratedAdventure | null>(null);
  const [myPosition, setMyPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [filterType, setFilterType] = useState<AdventureType | 'all'>('all');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const filteredAdventures = useMemo(() => {
    const now = new Date();
    // Filter for adventures that have not started yet
    const futureAdventures = adventuresToShow.filter(adv => new Date(adv.startDate) >= now);

    if (filterType === 'all') {
      return futureAdventures;
    }
    return futureAdventures.filter(adventure => adventure.type === filterType);
  }, [adventuresToShow, filterType]);

  const firstAdventureWithCoords = filteredAdventures.find(p => p.coordinates);
  const center = {
    lat: firstAdventureWithCoords?.coordinates?.lat ?? 51.505,
    lng: firstAdventureWithCoords?.coordinates?.lng ?? -0.09,
  };

  const onMarkerClick = (adventure: HydratedAdventure) => {
    setSelectedLocalAdventure(adventure);
    setDirections(null); // Clear previous directions
    if ( (adventure.type === AdventureType.Hiking || adventure.type === AdventureType.Cycling) && adventure.coordinates && adventure.endCoordinates) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: adventure.coordinates,
                destination: adventure.endCoordinates,
                travelMode: window.google.maps.TravelMode.WALKING, // or BICYCLING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    }
  };
  
  const onInfoWindowClose = () => {
    setSelectedLocalAdventure(null);
    setDirections(null);
  }

  const handleViewDetails = (adventure: HydratedAdventure) => {
    onSelectAdventure(adventure); // Open the main modal
    setSelectedLocalAdventure(null); // Close the info window
  };

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

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedLocalAdventure(null);
    setDirections(null);
  }, [filterType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, { month: 'short', day: 'numeric' });
  };

  const filterOptions = [
    { type: 'all' as const, icon: <GridIcon />, labelKey: 'allTypes' },
    { type: AdventureType.Travel, icon: <PlaneIcon />, labelKey: `AdventureType_${AdventureType.Travel}` },
    { type: AdventureType.Volunteering, icon: <HeartIcon />, labelKey: `AdventureType_${AdventureType.Volunteering}` },
    { type: AdventureType.Hiking, icon: <HikingIcon />, labelKey: `AdventureType_${AdventureType.Hiking}` },
    { type: AdventureType.Camping, icon: <TentIcon />, labelKey: `AdventureType_${AdventureType.Camping}` },
    { type: AdventureType.Cycling, icon: <BicycleIcon />, labelKey: `AdventureType_${AdventureType.Cycling}` },
    { type: AdventureType.Event, icon: <GroupIcon />, labelKey: `AdventureType_${AdventureType.Event}` },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-light-bg dark:bg-dark-bg border-b dark:border-zinc-800 p-2 overflow-x-auto">
          <div className="flex space-x-2">
              {filterOptions.map(option => (
                  <FilterButton
                      key={option.type}
                      icon={option.icon}
                      label={t(option.labelKey)}
                      isActive={filterType === option.type}
                      onClick={() => setFilterType(option.type)}
                  />
              ))}
          </div>
      </div>
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
                mapTypeId: 'terrain'
              }}
            >
              {filteredAdventures.map(adventure => (
                adventure.coordinates && (
                  <MarkerF
                    key={adventure.id}
                    position={adventure.coordinates}
                    onClick={() => onMarkerClick(adventure)}
                    icon={{
                      url: getAdventureIconDataUrl(adventure.type),
                      scaledSize: new window.google.maps.Size(36, 48),
                    }}
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

              {selectedLocalAdventure && selectedLocalAdventure.coordinates && !directions && (
                <InfoWindowF
                  position={selectedLocalAdventure.coordinates}
                  onCloseClick={onInfoWindowClose}
                >
                  <div className="p-1 w-48 text-gray-800">
                    <p className="text-xs font-semibold text-brand-orange">{t(`AdventureType_${selectedLocalAdventure.type}`)}</p>
                    <h3 className="font-bold text-base mb-1">{selectedLocalAdventure.title}</h3>
                    <p className="text-xs text-gray-600">
                        🗓️ {formatDate(selectedLocalAdventure.startDate)}
                        {selectedLocalAdventure.endDate && ` - ${formatDate(selectedLocalAdventure.endDate)}`}
                    </p>
                    <button
                      onClick={() => handleViewDetails(selectedLocalAdventure)}
                      className="mt-2 w-full bg-brand-orange text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-brand-orange-light transition-colors"
                    >
                      {t('viewAdventure')}
                    </button>
                  </div>
                </InfoWindowF>
              )}

              {directions && (
                <DirectionsRenderer 
                    directions={directions} 
                    options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#F97316', strokeWeight: 5 } }} 
                />
              )}
            </GoogleMap>
            <button
              onClick={handleShowMyLocation}
              className="absolute bottom-4 end-4 z-10 bg-white dark:bg-zinc-800 p-3 rounded-full shadow-lg"
              aria-label={t('showMyLocation')}
            >
              <MyLocationIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-orange"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MapScreen);
