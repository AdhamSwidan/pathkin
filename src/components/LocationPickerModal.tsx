

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, MarkerF, StandaloneSearchBox, DirectionsRenderer } from '@react-google-maps/api';
import { useTranslation } from '../contexts/LanguageContext';
import MyLocationIcon from './icons/MyLocationIcon';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  onRouteSelect?: (start: { address: string, coords: {lat: number, lng: number}}, end: { address: string, coords: {lat: number, lng: number}}) => void;
  initialPosition?: { lat: number; lng: number };
  mode?: 'point' | 'route';
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 51.5072,
  lng: -0.1276, // London
};

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose, onLocationSelect, onRouteSelect, initialPosition, mode = 'point' }) => {
  const { t } = useTranslation();
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(initialPosition || null);
  const [startPoint, setStartPoint] = useState<{ address: string, coords: {lat: number, lng: number}} | null>(null);
  const [endPoint, setEndPoint] = useState<{ address: string, coords: {lat: number, lng: number}} | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
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
      if (mode === 'point') {
        mapRef.current?.panTo(newPos);
        mapRef.current?.setZoom(15);
      }
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
       const geocoder = new window.google.maps.Geocoder();
       geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
             const address = results[0].formatted_address;
             if (mode === 'point') {
                setMarkerPosition(newPos);
             } else { // route mode
                if (!startPoint) {
                   setStartPoint({ address, coords: newPos });
                } else if (!endPoint) {
                   setEndPoint({ address, coords: newPos });
                }
             }
          } else {
             setAlertMessage(t('noAddressFound'));
          }
       });
    }
  }, [mode, startPoint, endPoint, t]);

  useEffect(() => {
    if (mode === 'route' && startPoint && endPoint) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startPoint.coords,
          destination: endPoint.coords,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          }
        }
      );
    }
  }, [startPoint, endPoint, mode]);
  
  const handleConfirm = () => {
    if (mode === 'point') {
        if (!markerPosition) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: markerPosition }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                onLocationSelect(results[0].formatted_address, markerPosition);
            } else {
                setAlertMessage(t('noAddressFound'));
            }
        });
    } else { // route mode
        if(startPoint && endPoint && onRouteSelect) {
            onRouteSelect(startPoint, endPoint);
        }
    }
  };
  
  const handleShowMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if(mode === 'point') {
            setMarkerPosition(pos);
          }
          mapRef.current?.panTo(pos);
          mapRef.current?.setZoom(15);
        },
        () => {
          setAlertMessage(t('locationPermissionDenied'));
        }
      );
    } else {
      setAlertMessage(t('locationUnavailable'));
    }
  };
  
  const resetState = () => {
    setMarkerPosition(initialPosition || null);
    setStartPoint(null);
    setEndPoint(null);
    setDirections(null);
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  };

  if (!isOpen) return null;
  
  const getTopBarText = () => {
    if (mode === 'route') {
      if (!startPoint) return t('selectStartPoint');
      if (!endPoint) return t('selectEndPoint');
      return t('routeSelected');
    }
    return t('searchForLocation');
  };

  const isConfirmDisabled = mode === 'point' ? !markerPosition : (!startPoint || !endPoint);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[102] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col relative">
        <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">{mode === 'route' ? t('drawRouteOnMap') : t('selectOnMap')}</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <div className="flex-grow relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={initialPosition || defaultCenter}
                zoom={initialPosition ? 15 : 8}
                onLoad={onMapLoad}
                onClick={onMapClick}
            >
                {mode === 'point' && markerPosition && <MarkerF position={markerPosition} />}
                {mode === 'route' && startPoint && <MarkerF position={startPoint.coords} label="A" />}
                {mode === 'route' && endPoint && <MarkerF position={endPoint.coords} label="B" />}
                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#F97316', strokeWeight: 5 } }} />}
            </GoogleMap>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
                {mode === 'point' ? (
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
                ) : (
                    <div className="p-3 rounded-md shadow-lg bg-white dark:bg-neutral-800 text-center font-semibold text-gray-800 dark:text-gray-200">
                        {getTopBarText()}
                    </div>
                )}
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
          <button onClick={handleConfirm} disabled={isConfirmDisabled} className="w-full bg-orange-600 text-white font-bold py-3 rounded-md hover:bg-orange-700 disabled:bg-orange-300 transition-colors">
            {t('confirmLocation')}
          </button>
        </div>

        {alertMessage && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20" role="alertdialog" aria-modal="true" aria-labelledby="alert-dialog-title">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-6 w-11/12 max-w-sm text-center shadow-xl animate-fade-in-up">
              <p id="alert-dialog-title" className="text-gray-800 dark:text-gray-200 mb-6">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="bg-brand-orange text-white px-8 py-2.5 rounded-full font-semibold hover:bg-brand-orange-light transition-colors"
              >
                {t('ok')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPickerModal;