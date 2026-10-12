import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
} from "@vis.gl/react-google-maps";
import { useState } from "react";

interface TrackingMapProps {
  latitude: number;
  longitude: number;
  busNumber: string;
  driverName: string;
  speed: number;
  status: string;
}

export default function TrackingMap({
  latitude,
  longitude,
  busNumber,
  driverName,
  speed,
  status,
}: TrackingMapProps) {
  const [showInfo, setShowInfo] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-red-200 bg-red-50">
        <div className="px-6 text-center">
          <p className="text-lg font-bold text-red-700">
            Google Maps API key not found
          </p>

          <p className="mt-2 text-sm text-red-600">
            Check VITE_GOOGLE_MAPS_API_KEY in your .env file.
          </p>
        </div>
      </div>
    );
  }

  const position = {
    lat: latitude,
    lng: longitude,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Live Bus Location
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Real-time GPS position
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />

          <span className="text-xs font-semibold text-green-700">
            Live
          </span>
        </div>
      </div>

      {/* Google Map */}
      <div className="h-[480px] w-full">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="SMART_BUS_TRACKING_MAP"
            className="h-full w-full"
          >
            <AdvancedMarker
              position={position}
              title={busNumber}
              onClick={() => setShowInfo(true)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-2xl shadow-lg">
                🚌
              </div>
            </AdvancedMarker>

            {showInfo && (
              <InfoWindow
                position={position}
                onCloseClick={() => setShowInfo(false)}
              >
                <div className="min-w-[190px] px-1 py-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {busNumber}
                  </h3>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Driver:</strong>{" "}
                      {driverName}
                    </p>

                    <p>
                      <strong>Speed:</strong>{" "}
                      {speed} km/h
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {status}
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Coordinates */}
      <div className="border-t border-gray-200 px-5 py-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          <span>
            Latitude:{" "}
            <strong className="text-gray-700">
              {latitude.toFixed(6)}
            </strong>
          </span>

          <span>
            Longitude:{" "}
            <strong className="text-gray-700">
              {longitude.toFixed(6)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}