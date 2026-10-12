import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function BusAttendanceQR() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function generateToken() {
    try {
      setError("");

      // Get logged-in driver
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Driver is not logged in.");
      }
      console.log("Logged-in email:", user?.email);
      console.log("Logged-in user ID:", user?.id);

      // Get driver

      // Get driver linked to the logged-in account
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("id, bus_id, profile_id, name")
        .eq("profile_id", user.id)
        .maybeSingle();

      console.log("Logged-in email:", user.email);
      console.log("Logged-in user ID:", user.id);
      console.log("Driver query error:", driverError);
      console.log("Driver record:", driver);

      if (driverError) {
        throw new Error(`Driver query failed: ${driverError.message}`);
      }

      if (!driver) {
        throw new Error(
          `No driver record found for logged-in user: ${user.id}`
        );
      }

      if (!driver.bus_id) {
        throw new Error("No bus is assigned to this driver.");
      }


      // Get active trip
      const { data: trip, error: tripError } =
        await supabase
          .from("trips")
          .select("id, bus_id, trip_status")
          .eq("driver_id", driver.id)
          .eq("bus_id", driver.bus_id)
          .eq("trip_status", "started")
          .order("start_time", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (tripError) {
        throw new Error(tripError.message);
      }

      if (!trip) {
        throw new Error(
          "No active trip found. Start Live Tracking first."
        );
      }

      // Create a new one-time token
      const newToken =
        crypto.randomUUID() + "-" + Date.now();

      const now = new Date();

      const expiresAt = new Date(
        now.getTime() + 10000
      );

      // Save token in database
      const { error: insertError } =
        await supabase
          .from("bus_attendance_qr_tokens")
          .insert({
            trip_id: trip.id,
            bus_id: driver.bus_id,
            token: newToken,
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setToken(newToken);
      setSecondsLeft(10);
      setLoading(false);

    } catch (err: any) {
      console.error(
        "QR generation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to generate attendance QR."
      );

      setToken("");
      setLoading(false);
    }
  }

  useEffect(() => {
    generateToken();

    const interval = setInterval(() => {
      generateToken();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) =>
        prev > 1 ? prev - 1 : 10
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">

      ```tsx
<button
  type="button"
  onClick={() => navigate(-1)}
  style={{
    display: "block",
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    border: "2px solid #334155",
    borderRadius: "8px",
    position: "relative",
    zIndex: 10,
  }}
>
  ← Back
</button>
```

      <h1 className="text-2xl font-bold text-slate-900">
        Bus Attendance QR
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Students can scan this QR to mark attendance
      </p>

      {loading && (
        <p className="mt-8 text-sm text-slate-500">
          Generating QR...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {token && !error && (
        <>
          <div className="mt-8 flex justify-center">
            <QRCodeSVG
              value={token}
              size={280}
              level="H"
              includeMargin
            />
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">
              QR refreshes in
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-600">
              {secondsLeft}s
            </p>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Each QR token is temporary and can be
            used only once.
          </p>
        </>
      )}

    </div>
  </div>
);
}
