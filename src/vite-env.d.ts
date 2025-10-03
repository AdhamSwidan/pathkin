// Fix: Removed reference to "vite/client" as it was causing a type definition resolution error.
// The necessary types for `import.meta.env` are explicitly defined below, which is sufficient for the app's needs.

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix: Add minimal type definitions for the Google Maps JavaScript API.
// This resolves "Cannot find namespace 'google'" and related errors across the components
// that use the Places API for location autocompletion.
// Fix: Expanded Google Maps type definitions to include missing members like Map, LatLngLiteral, Geocoder, and SearchBox, resolving multiple TypeScript errors.
declare namespace google.maps {
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Map {
    constructor(mapDiv: Element, opts?: any);
    panTo(latLng: LatLngLiteral | any): void;
    setZoom(zoom: number): void;
  }

  // Fix: Add missing 'Size' class definition to resolve error in MapScreen.tsx.
  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
  }

  enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
  }

  interface MapMouseEvent {
    latLng: {
      lat: () => number;
      lng: () => number;
    } | null;
  }

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
    ): void;
  }

  interface GeocoderRequest {
    location: LatLngLiteral;
  }

  interface GeocoderResult {
    formatted_address: string;
  }

  enum GeocoderStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    ERROR = 'ERROR',
    INVALID_REQUEST = 'INVALID_REQUEST',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  }

  namespace places {
    interface AutocompletePrediction {
      description: string;
      place_id: string;
    }

    class AutocompleteService {
      getPlacePredictions(
        request: AutocompletionRequest,
        callback: (
          results: AutocompletePrediction[] | null,
          status: PlacesServiceStatus
        ) => void
      ): void;
    }

    interface AutocompletionRequest {
      input: string;
      types?: string[];
    }

    class PlacesService {
      constructor(attrContainer: HTMLDivElement);
      getDetails(
        request: PlaceDetailsRequest,
        callback: (
          result: PlaceResult | null,
          status: PlacesServiceStatus
        ) => void
      ): void;
    }

    class SearchBox {
      constructor(inputElement: HTMLInputElement);
      getPlaces(): PlaceResult[] | undefined;
    }

    interface PlaceDetailsRequest {
      placeId: string;
      fields: string[];
    }
    
    interface PlaceResult {
        geometry?: {
            location: {
                lat: () => number;
                lng: () => number;
            };
        };
    }

    enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      NOT_FOUND = 'NOT_FOUND',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    }
  }
}

// Fix: Augment the Window interface to include the `google` object.
// This resolves "Property 'google' does not exist on type 'Window'" errors.
interface Window {
  google: typeof google;
}
