import {
  BusFront,
  Gauge,
  MapPin,
  Navigation,
  UserRound,
  Clock3,
  Route as RouteIcon,
} from "lucide-react";

interface BusTrackingCardProps {
  busNumber: string;
  driverName: string;
  routeName: string;
  speed: number;
  gpsAccuracy: number;
  status: string;
  source: string;
  destination: string;
  totalDistance: number | null;
  estimatedTime: number | null;
}

export default function BusTrackingCard({
  busNumber,
  driverName,
  routeName,
  speed,
  gpsAccuracy,
  status,
  source,
  destination,
  totalDistance,
  estimatedTime,
}: BusTrackingCardProps) {
  const isActive = status.toLowerCase() === "started";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <BusFront className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {busNumber}
            </h3>
            <p className="text-sm text-gray-500">Live Bus</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isActive ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {status}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <UserRound className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">Driver</p>
            <p className="text-sm font-semibold text-gray-900">
              {driverName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">Route</p>
            <p className="text-sm font-semibold text-gray-900">
              {routeName}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {source} → {destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RouteIcon className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Route Distance
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {totalDistance !== null
                ? `${totalDistance} km`
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock3 className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">
              Estimated Route Time
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {estimatedTime !== null
                ? `${estimatedTime} minutes`
                : "Not available"}
            </p>
            <p className="text-xs text-gray-500">
              Stored route estimate; not a live traffic prediction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">
              Current Speed
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {speed} km/h
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">
              GPS Accuracy
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {gpsAccuracy} m
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}