import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BusFront,
  Clock3,
  RefreshCw,
  Radio,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

import TrackingStats from "./components/TrackingStats";
import BusTrackingCard from "./components/BusTrackingCard";
import TrackingMap from "./components/TrackingMap";

type Trip = {
  id: string;
  bus_id: string;
  driver_id: string;
  route_id: string | null;
  trip_status: string | null;
  start_time: string | null;
};

type Bus = {
  id: string;
  bus_number: string;
  registration_number: string;
  status: string | null;
};

type Driver = {
  id: string;
  name: string | null;
};


type Route = {
  id: string;
  route_name: string;
  source: string;
  destination: string;
  total_distance: number | null;
  estimated_time: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
};


type BusLocation = {
  id: string;
  trip_id: string;
  bus_id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recorded_at: string | null;
};

type TrackingBus = {
  trip: Trip;
  bus: Bus | null;
  driver: Driver | null;
  route: Route | null;
  location: BusLocation | null;
};

// STEP 10 FUNCTION — INGA PASTE PANNU
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveTracking() {
  const [trackingBuses, setTrackingBuses] = useState<TrackingBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchTrackingData = useCallback(async () => {
    try {
      setError("");

      // =====================================================
      // 1. FETCH ACTIVE TRIPS
      // =====================================================

      const {
        data: tripData,
        error: tripError,
      } = await supabase
        .from("trips")
        .select(
          "id, bus_id, driver_id, route_id, trip_status, start_time"
        )
        .eq("trip_status", "started")
        .order("start_time", {
          ascending: false,
        });

      if (tripError) {
        throw new Error(tripError.message);
      }

      const trips = (tripData || []) as Trip[];

      // No active buses
      if (trips.length === 0) {
        setTrackingBuses([]);
        return;
      }

      // =====================================================
      // 2. GET IDS
      // =====================================================

      const busIds = Array.from(
        new Set(trips.map((trip) => trip.bus_id).filter(Boolean))
      );

      const driverIds = Array.from(
        new Set(trips.map((trip) => trip.driver_id).filter(Boolean))
      );

      const routeIds = Array.from(
        new Set(
          trips
            .map((trip) => trip.route_id)
            .filter(Boolean) as string[]
        )
      );

      const tripIds = trips.map((trip) => trip.id);

      // =====================================================
      // 3. FETCH BUSES
      // =====================================================

      const {
        data: busData,
        error: busError,
      } = await supabase
        .from("buses")
        .select(
          "id, bus_number, registration_number, status"
        )
        .in("id", busIds);

      if (busError) {
        throw new Error(busError.message);
      }

      const buses = (busData || []) as Bus[];

      // =====================================================
      // 4. FETCH DRIVERS
      // =====================================================

      const {
        data: driverData,
        error: driverError,
      } = await supabase
        .from("drivers")
        .select("id, name")
        .in("id", driverIds);

      if (driverError) {
        throw new Error(driverError.message);
      }

      const drivers = (driverData || []) as Driver[];

      // =====================================================
      // 5. FETCH ROUTES
      // =====================================================

      let routes: Route[] = [];

      if (routeIds.length > 0) {
        const {
          data: routeData,
          error: routeError,
        } = await supabase
          .from("routes")
          .select(`
            id,
            route_name,
            source,
            destination,
            total_distance,
            estimated_time,
            destination_latitude,
            destination_longitude
          `)
          .in("id", routeIds);

        if (routeError) {
          console.error("Route fetch error:", routeError);
          throw new Error(routeError.message);
        }

        routes = (routeData || []) as Route[];


        console.log("Route IDs from trip:", routeIds);
        console.log("Routes fetched:", routes);
      }

      // =====================================================
      // 6. FETCH GPS LOCATIONS
      // =====================================================

      const {
        data: locationData,
        error: locationError,
      } = await supabase
        .from("bus_locations")
        .select(
          `
            id,
            trip_id,
            bus_id,
            driver_id,
            latitude,
            longitude,
            speed,
            heading,
            accuracy,
            recorded_at
          `
        )
        .in("trip_id", tripIds)
        .order("recorded_at", {
          ascending: false,
        });

      if (locationError) {
        throw new Error(locationError.message);
      }

      const locations = (locationData || []) as BusLocation[];

      // =====================================================
      // 7. GET LATEST LOCATION FOR EACH TRIP
      // =====================================================

      const latestLocationByTrip = new Map<
        string,
        BusLocation
      >();

      for (const location of locations) {
        if (!latestLocationByTrip.has(location.trip_id)) {
          latestLocationByTrip.set(
            location.trip_id,
            location
          );
        }
      }

      // =====================================================
      // 8. COMBINE ALL DATA
      // =====================================================

      const combinedData: TrackingBus[] = trips.map(
        (trip) => ({
          trip,

          bus:
            buses.find(
              (bus) => bus.id === trip.bus_id
            ) || null,

          driver:
            drivers.find(
              (driver) => driver.id === trip.driver_id
            ) || null,

          route:
            trip.route_id
              ? routes.find(
                  (route) => route.id === trip.route_id
                ) || null
              : null,

          location:
            latestLocationByTrip.get(trip.id) || null,
        })
      );

      console.log(
        "Live tracking data:",
        combinedData
      );

      setTrackingBuses(combinedData);
    } catch (err: any) {
      console.error(
        "Failed to load tracking data:",
        err
      );

      setError(
        err?.message ||
          "Unable to load live tracking data."
      );

      setTrackingBuses([]);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchTrackingData();
      setLoading(false);
    }

    load();
  }, [fetchTrackingData]);

  // =====================================================
  // REALTIME GPS UPDATES
  // =====================================================

  useEffect(() => {
    const channel = supabase
      .channel("live-bus-gps")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bus_locations",
        },
        (payload) => {
          console.log("📍 New GPS update received:", payload.new);

          // Reload latest GPS data
          fetchTrackingData();
        }
      )
      .subscribe((status) => {
        console.log("📡 GPS Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTrackingData]);


  // =====================================================
  // AUTOMATIC LIVE TRACKING REFRESH
  // =====================================================

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchTrackingData();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchTrackingData]);


  // =====================================================
  // REFRESH
  // =====================================================

  async function handleRefresh() {
    setRefreshing(true);

    await fetchTrackingData();

    setRefreshing(false);
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const uniqueActiveBuses = Array.from(
  new Map(
    trackingBuses
      .map((item) =>
        item.bus ? [item.bus.id, item] as const : null
      )
      .filter((entry) => entry !== null)
  ).values()
);

const activeBuses = uniqueActiveBuses.length;

const onRoute = uniqueActiveBuses.filter(
  (item) => item.trip.trip_status === "started"
).length;


  const speeds = trackingBuses
    .map((item) => item.location?.speed)
    .filter(
      (speed): speed is number =>
        speed !== null &&
        speed !== undefined
    );

  const averageSpeed =
    speeds.length > 0
      ? Number(
          (
            speeds.reduce(
              (total, speed) =>
                total + speed,
              0
            ) / speeds.length
          ).toFixed(1)
        )
      : 0;

  const accuracies = trackingBuses
    .map((item) => item.location?.accuracy)
    .filter(
      (accuracy): accuracy is number =>
        accuracy !== null &&
        accuracy !== undefined
    );

  const gpsAccuracy =
    accuracies.length > 0
      ? Number(
          (
            accuracies.reduce(
              (total, accuracy) =>
                total + accuracy,
              0
            ) / accuracies.length
          ).toFixed(1)
        )
      : 0;

  // =====================================================
  // PRIMARY BUS
  // =====================================================

  const primaryBus = trackingBuses[0];

const remainingDistanceKm = (() => {
  const location = primaryBus?.location;
  const route = primaryBus?.route;

  if (
    !location ||
    !route ||
    route.destination_latitude == null ||
    route.destination_longitude == null
  ) {
    return null;
  }

  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    return null;
  }

  if (
    location.accuracy != null &&
    location.accuracy > 100
  ) {
    return null;
  }

  return Number(
    calculateDistanceKm(
      location.latitude,
      location.longitude,
      route.destination_latitude,
      route.destination_longitude
    ).toFixed(2)
  );
})();

const etaMinutes = (() => {
  const speed = primaryBus?.location?.speed;

  if (
    remainingDistanceKm == null ||
    speed == null ||
    !Number.isFinite(speed) ||
    speed < 5
  ) {
    return null;
  }

  return Math.ceil((remainingDistanceKm / speed) * 60);
})();

  const gpsAgeSeconds = primaryBus?.location?.recorded_at
  ? Math.max(
      0,
      Math.floor(
        (Date.now() -
          new Date(primaryBus.location.recorded_at).getTime()) /
          1000
      )
    )
  : null;

const isGpsStale =
  gpsAgeSeconds === null || gpsAgeSeconds > 120;
  const lastUpdated = primaryBus?.location?.recorded_at
    ? new Date(
        primaryBus.location.recorded_at
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "No GPS data";

  // =====================================================
  // MAP DATA
  // =====================================================

  const mapData = useMemo(() => {
    if (
      !primaryBus?.location ||
      !primaryBus.bus ||
      !primaryBus.driver
    ) {
      return null;
    }

    return {
      latitude:
        primaryBus.location.latitude,

      longitude:
        primaryBus.location.longitude,

      busNumber:
        primaryBus.bus.bus_number,

      driverName:
        primaryBus.driver.name ||
        "Unknown Driver",

      speed:
        primaryBus.location.speed || 0,

      status:
        primaryBus.trip.trip_status ||
        "Unknown",
    };
  }, [primaryBus]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                <Radio className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Live Bus Tracking
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor active buses and their real-time GPS locations.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load tracking data
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-slate-400" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading live tracking...
              </p>

            </div>

          </div>
        ) : (
          <>
            {/* ================================================= */}
            {/* STATS */}
            {/* ================================================= */}

            <TrackingStats
              activeBuses={activeBuses}
              onRoute={onRoute}
              averageSpeed={averageSpeed}
              gpsAccuracy={gpsAccuracy}
            />

            {/* ================================================= */}
            {/* EMPTY STATE */}
            {/* ================================================= */}

            {trackingBuses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <BusFront className="h-8 w-8 text-slate-400" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No active buses
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no started trips with live tracking data.
                  Start a bus trip and send GPS data to see it here.
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Again
                </button>

              </div>
            ) : (
              <>
                {/* ================================================= */}
                {/* MAP + BUS CARD */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

                  {/* MAP */}

                  <div>
                    {mapData ? (
                      <TrackingMap
                        latitude={mapData.latitude}
                        longitude={mapData.longitude}
                        busNumber={mapData.busNumber}
                        driverName={mapData.driverName}
                        speed={mapData.speed}
                        status={mapData.status}
                      />
                    ) : (
                      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="text-center">

                          <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />

                          <p className="mt-3 font-semibold text-slate-700">
                            GPS location unavailable
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Waiting for the first GPS location.
                          </p>

                        </div>

                      </div>
                    )}
                  </div>

                  {/* BUS DETAILS */}

                  {primaryBus && (
                    <div>
                      <BusTrackingCard
                        busNumber={
                          primaryBus.bus?.bus_number ||
                          "Unknown Bus"
                        }

                        driverName={
                          primaryBus.driver?.name ||
                          "Unknown Driver"
                        }

                        routeName={
                          primaryBus.route?.route_name ||
                          "Route not assigned"
                        }

                        speed={
                          primaryBus.location?.speed ||
                          0
                        }

                        gpsAccuracy={
                          primaryBus.location?.accuracy ||
                          0
                        }

                        status={
                          primaryBus.trip.trip_status ||
                          "Unknown"
                        }
                        source={primaryBus.route?.source || "Unknown"}
                        destination={primaryBus.route?.destination || "Unknown"}
                        totalDistance={primaryBus.route?.total_distance ?? null}
                        estimatedTime={primaryBus.route?.estimated_time ?? null}
                        remainingDistanceKm={remainingDistanceKm}
                        etaMinutes={etaMinutes}
                      />

                      {/* Last Updated */}

                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <Clock3 className="h-5 w-5 text-slate-600" />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Last GPS Update
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-900">
                            {lastUpdated}
                          </p>

                          <p
                            className={`mt-1 text-xs font-semibold ${
                              isGpsStale ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isGpsStale
                            ? `GPS signal may be stale${
                              gpsAgeSeconds !== null
                                ? ` (${Math.floor(gpsAgeSeconds / 60)} min ago)`
                                : ""
                            }`
                          : "GPS signal is recent"}
                        </p>
                        </div>

                      </div>
                    </div>
                  )}

                </div>

                {/* ================================================= */}
                {/* MULTIPLE BUS NOTICE */}
                {/* ================================================= */}

                {trackingBuses.length > 1 && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <strong>
                      {trackingBuses.length} buses
                    </strong>{" "}
                    are currently active. The map currently focuses on the
                    latest active bus.
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </AppLayout>
  );
}
