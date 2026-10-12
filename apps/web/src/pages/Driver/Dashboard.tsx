import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BusFront,
  MapPin,
  Navigation,
  Radio,
  Square,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type DriverInfo = {
  id: string;
  profile_id: string;
  bus_id: string | null;
  name: string | null;
};

type BusInfo = {
  id: string;
  bus_number: string;
  route_id: string | null;
};


export default function DriverDashboard() {
  const [driver, setDriver] =
    useState<DriverInfo | null>(null);

  const [bus, setBus] =
    useState<BusInfo | null>(null);

  const [tracking, setTracking] =
    useState(false);

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [speed, setSpeed] =
    useState<number>(0);

  const [accuracy, setAccuracy] =
    useState<number>(0);

  const [error, setError] =
    useState("");

  const [lastUpdate, setLastUpdate] =
    useState("");

  const [loadingDriver, setLoadingDriver] =
    useState(true);

  const watchIdRef =
    useRef<number | null>(null);

  const lastSentRef =
    useRef<number>(0);

  const navigate = useNavigate();

  // =====================================================
  // LOAD LOGGED-IN DRIVER
  // =====================================================

  useEffect(() => {
    async function loadDriver() {
      try {
        setLoadingDriver(true);
        setError("");

        // Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error(
            "No logged-in user found."
          );
        }

        console.log(
          "Logged-in user:",
          user.id
        );

        // Get driver using profile_id
        const {
          data: driverData,
          error: driverError,
        } = await supabase
          .from("drivers")
          .select(
            "id, profile_id, bus_id, name"
          )
          .eq("profile_id", user.id)
          .single();

        if (driverError) {
          throw new Error(
            driverError.message
          );
        }

        if (!driverData) {
          throw new Error(
            "Driver profile not found."
          );
        }

        setDriver(driverData);

        console.log(
          "Driver:",
          driverData
        );

        // =============================================
        // GET ASSIGNED BUS
        // =============================================

        if (!driverData.bus_id) {
          setBus(null);
          return;
        }

        const {
          data: busData,
          error: busError,
        } = await supabase
          .from("buses")
          .select(
            "id, bus_number, route_id"
          )
          .eq("id", driverData.bus_id)
          .single();

        if (busError) {
          throw new Error(
            busError.message
          );
        }

        setBus(busData);

        console.log(
          "Assigned Bus:",
          busData
        );
      } catch (err: any) {
        console.error(
          "Driver loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load driver information."
        );
      } finally {
        setLoadingDriver(false);
      }
    }

    loadDriver();
  }, []);

  // =====================================================
  // STOP GPS WHEN PAGE CLOSES
  // =====================================================

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };
  }, []);

  // =====================================================
  // START TRACKING
  // =====================================================



async function startTracking() {
  setError("");

  if (!driver || !bus?.id) {
    setError("Driver or assigned bus information is missing.");
    return;
  }

  if (!bus.route_id) {
    setError("No route is assigned to this bus.");
    return;
  }

  if (!navigator.geolocation) {
    setError("GPS is not supported by this device/browser.");
    return;
  }

  try {
    // Clear any previous GPS watcher.
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Find an existing active trip.
    const { data: existingTrip, error: lookupError } =
      await supabase
        .from("trips")
        .select("id")
        .eq("driver_id", driver.id)
        .eq("bus_id", bus.id)
        .eq("trip_status", "started")
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (lookupError) throw lookupError;

    // Create a trip if no active trip exists.
    if (!existingTrip) {



    // Find today's active trip or close stale trips.
    const now = new Date();

    const localDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    // Find the latest active trip for this driver and bus.
    const { data: existingTrip, error: lookupError } =
      await supabase
        .from("trips")
        .select("id, trip_date")
        .eq("driver_id", driver.id)
        .eq("bus_id", bus.id)
        .eq("trip_status", "started")
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (lookupError) throw lookupError;

    let activeTripId: string;

    if (existingTrip && existingTrip.trip_date === localDate) {
      // Reuse today's active trip.
      activeTripId = existingTrip.id;
    } else {
      // Close the previous day's active trip, if any.
      if (existingTrip) {
        const { error: closeError } = await supabase
          .from("trips")
          .update({
            trip_status: "completed",
            end_time: now.toISOString(),
          })
          .eq("id", existingTrip.id)
          .eq("trip_status", "started");

        if (closeError) throw closeError;
      }

      // Create today's trip.
      const { data: newTrip, error: createError } =
        await supabase
          .from("trips")
          .insert({
            bus_id: bus.id,
            driver_id: driver.id,
            route_id: bus.route_id,
            trip_date: localDate,
            start_time: now.toISOString(),
            trip_status: "started",
          })
          .select("id")
          .single();

      if (createError) throw createError;
      if (!newTrip) throw new Error("Trip creation failed.");

      activeTripId = newTrip.id;
    }

    console.log("Active trip for tracking:", activeTripId);

    }


    // Check browser geolocation support
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported on this device.");
      return;
    }

    // Start GPS tracking
    lastSentRef.current = 0;
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const {
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
        } = position.coords;


        // Reject unreliable GPS readings.
        if (accuracy > 100) {
          setError(
            `GPS signal weak. Accuracy: ${Math.round(accuracy)} m. Move outdoors or enable phone GPS.`
          );
          return;
        }

        setLatitude(latitude);
        setLongitude(longitude);

        const currentSpeed =
          speed !== null && speed >= 0
            ? Number((speed * 3.6).toFixed(1))
            : 0;

        setSpeed(currentSpeed);
        setAccuracy(Number(accuracy.toFixed(1)));

        const now = Date.now();

        // Upload a location at most once every 5 seconds.
        if (now - lastSentRef.current < 5000) return;
        lastSentRef.current = now;

        try {
          const { data: trip, error: tripError } =
            await supabase
              .from("trips")
              .select("id")
              .eq("driver_id", driver.id)
              .eq("bus_id", bus.id)
              .eq("trip_status", "started")
              .order("start_time", { ascending: false })
              .limit(1)
              .maybeSingle();

          if (tripError) throw tripError;
          if (!trip) {
            throw new Error("No active trip found.");
          }

          console.log("GPS UPLOAD ATTEMPT", {
            tripId: trip.id,
            latitude,
            longitude,
            accuracy,
            time: new Date().toLocaleTimeString(),
          });

          const {
            error: locationError
          } = await supabase
            .from("bus_locations")
            .insert({
              trip_id: trip.id,
              bus_id: bus.id,
              driver_id: driver.id,
              latitude,
              longitude,
              speed: currentSpeed,
              heading: heading ?? null,
              accuracy,
              recorded_at: new Date().toISOString(),
            });

          if (locationError) {
            console.error("GPS INSERT FAILED", locationError);
            throw locationError;
          }

          console.log("GPS INSERT SUCCESS", {
            latitude,
            longitude,
            time: new Date().toLocaleTimeString(),
          });

          setLastUpdate(new Date().toLocaleTimeString());
          setError("");
        } catch (uploadError: any) {
          console.error("GPS upload error:", uploadError);
          setError(
            uploadError?.message || "GPS upload failed."
          );
        }
      },
      (positionError) => {
        console.error("GPS error:", positionError);
        setError(
          positionError.message || "Unable to access GPS."
        );
        setTracking(false);

        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(
            watchIdRef.current
          );
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );
  } catch (err: any) {
    console.error("Start trip error:", err);
    setError(err?.message || "Unable to start the trip.");
    setTracking(false);
  }
}

  async function stopTracking() {
  // =============================================
  // STOP BROWSER GPS WATCHER IMMEDIATELY
  // =============================================

  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(
      watchIdRef.current
    );

    watchIdRef.current = null;
  }

  setTracking(false);
  setError("");

  if (!driver || !bus) {
    setSpeed(0);
    setAccuracy(0);
    return;
  }

  // =============================================
  // FIND ACTIVE TRIP
  // =============================================

  const {
    data: trip,
    error: tripError,
  } = await supabase
    .from("trips")
    .select("id")
    .eq("driver_id", driver.id)
    .eq("bus_id", bus.id)
    .eq("trip_status", "started")
    .order("start_time", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (tripError) {
    console.error(
      "Active trip lookup error:",
      tripError
    );

    setError(tripError.message);
    return;
  }

  if (!trip) {
    console.log(
      "No active trip found."
    );

    setSpeed(0);
    setAccuracy(0);
    setLastUpdate("");

    return;
  }

  // =============================================
  // COMPLETE TRIP
  // =============================================

  const endTime =
    new Date().toISOString();

  const {
    data: completedTrip,
    error: updateError,
  } = await supabase
    .from("trips")
    .update({
      trip_status: "completed",
      end_time: endTime,
    })
    .eq("id", trip.id)
    .select("id, trip_status, end_time")
    .maybeSingle();

  // =============================================
  // HANDLE UPDATE ERROR
  // =============================================

  if (updateError) {
    console.error(
      "Trip completion error:",
      updateError
    );

    setError(
      `Unable to complete trip: ${updateError.message}`
    );

    return;
  }

  // =============================================
  // VERIFY UPDATE REALLY HAPPENED
  // =============================================

  if (!completedTrip) {
    console.error(
      "Trip update returned no row. Check trips UPDATE RLS policy."
    );

    setError(
      "Trip could not be completed. Please check database permissions."
    );

    return;
  }

  // =============================================
  // RESET GPS UI
  // =============================================

  setSpeed(0);
  setAccuracy(0);
  setLastUpdate("");

  console.log(
    "Trip completed successfully:",
    completedTrip
  );

  alert(
    "Live tracking stopped successfully."
  );
}

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingDriver) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-600">
            Loading driver information...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md">

{/* HEADER */}
<div className="mb-6">
  <div className="mb-5 flex items-center justify-between gap-3">
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/login");
        }
      }}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
    >
      <ArrowLeft size={18} />
      Back
    </button>

    <button
      type="button"
      onClick={async () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        setTracking(false);

        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Sign out failed:", error);
          return;
        }

        navigate("/login", { replace: true });
      }}
      className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
    >
      <LogOut size={18} />
      Sign out
    </button>
  </div>

  <div className="text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
      <BusFront className="h-8 w-8 text-white" />
    </div>

    <h1 className="mt-4 text-3xl font-bold text-slate-900">
      Driver Dashboard
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      {driver?.name || "Driver"} • Live GPS Tracking
    </p>
  </div>
</div>


        {/* BUS INFO */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <BusFront className="h-5 w-5 text-slate-700" />
              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Assigned Bus
                </p>

                <p className="font-bold text-slate-900">
                  {bus?.bus_number ||
                    "No Bus Assigned"}
                </p>

              </div>

            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                tracking
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >

              <span
                className={`h-2 w-2 rounded-full ${
                  tracking
                    ? "bg-green-500"
                    : "bg-slate-400"
                }`}
              />

              {tracking
                ? "Live"
                : "Offline"}

            </div>

          </div>

          {/* START / STOP */}

          <button
            type="button"
            onClick={
              tracking
                ? stopTracking
                : startTracking
            }
            disabled={!bus}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition ${
              tracking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:cursor-not-allowed disabled:bg-slate-400`}
          >

            {tracking ? (
              <>
                <Square className="h-4 w-4" />
                Stop Live Tracking
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" />
                Start Live Tracking
              </>
            )}

          </button>

        </div>

        {/* Attendance QR */}
        <button
          type="button"
          onClick={() => navigate("/driver/attendance-qr")}
          disabled={!bus}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Show Attendance QR
        </button>

        {/* GPS DATA */}

        <div className="mt-4 grid grid-cols-2 gap-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-2">

              <Activity className="h-4 w-4 text-slate-500" />

              <span className="text-xs font-medium text-slate-500">
                Speed
              </span>

            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {speed}{" "}
              <span className="text-xs font-medium text-slate-500">
                km/h
              </span>
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-2">

              <MapPin className="h-4 w-4 text-slate-500" />

              <span className="text-xs font-medium text-slate-500">
                Accuracy
              </span>

            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {accuracy}{" "}
              <span className="text-xs font-medium text-slate-500">
                m
              </span>
            </p>

          </div>

        </div>

        {/* LOCATION */}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Navigation className="h-5 w-5 text-slate-600" />
            </div>

            <div>

              <p className="text-xs font-medium text-slate-500">
                Current GPS Location
              </p>

              {latitude !== null &&
              longitude !== null ? (
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {latitude.toFixed(6)},{" "}
                  {longitude.toFixed(6)}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  Waiting for GPS...
                </p>
              )}

            </div>

          </div>

          {lastUpdate && (
            <p className="mt-4 text-xs text-slate-500">
              Last uploaded:{" "}
              <span className="font-semibold text-slate-700">
                {lastUpdate}
              </span>
            </p>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <p className="font-semibold">
              GPS Tracking Error
            </p>

            <p className="mt-1">
              {error}
            </p>

          </div>
        )}

        {/* INSTRUCTION */}

        {!tracking && (
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">

            Tap{" "}
            <strong>
              Start Live Tracking
            </strong>{" "}
            and allow location access when your phone asks for permission.

          </p>
        )}

      </div>
    </div>
  );
}
