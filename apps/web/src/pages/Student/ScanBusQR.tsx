import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ScanBusQR() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("bus-qr-reader");
    scannerRef.current = scanner;
    let mounted = true;

    async function startScanner() {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (processingRef.current) return;
            processingRef.current = true;

            if (mounted) {
              setProcessing(true);
              setScanning(false);
            }

            try {
              await handleQRCode(decodedText);
            } catch (error: unknown) {
              console.error("QR processing error:", error);
              if (mounted) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Something went wrong while processing the QR."
                );
              }
            } finally {
              try {
                if (scanner.isScanning) await scanner.stop();
              } catch (error) {
                console.error("Scanner stop error:", error);
              }
              if (mounted) setProcessing(false);
            }
          },
          () => {}
        );
      } catch (error) {
        console.error("Camera error:", error);
        if (mounted) {
          setMessage("Unable to access camera. Please allow camera permission.");
          setScanning(false);
        }
      }
    }

    void startScanner();

    return () => {
      mounted = false;
      if (scanner.isScanning) void scanner.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  async function handleQRCode(token: string) {
    setMessage("QR detected. Validating...");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      setMessage("Please login as a student first.");
      return;
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, profile_id, bus_id, register_number")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) {
      setMessage("Student record not found for this login.");
      return;
    }

    const { data: qrToken, error: tokenError } = await supabase
      .from("bus_attendance_qr_tokens")
      .select("id, trip_id, bus_id, token, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) throw tokenError;
    if (!qrToken) {
      setMessage("Invalid QR code.");
      return;
    }
    if (qrToken.used_at) {
      setMessage("This QR code has already been used.");
      return;
    }
    if (new Date(qrToken.expires_at).getTime() <= Date.now()) {
      setMessage("This QR code has expired. Please scan a new QR.");
      return;
    }
    if (student.bus_id !== qrToken.bus_id) {
      setMessage("This QR belongs to another bus.");
      return;
    }

    const { data: activeTrip, error: tripError } = await supabase
      .from("trips")
      .select("id, bus_id, trip_status")
      .eq("id", qrToken.trip_id)
      .eq("bus_id", student.bus_id)
      .eq("trip_status", "started")
      .maybeSingle();

    if (tripError) throw tripError;
    if (!activeTrip) {
      setMessage("This bus does not have an active trip.");
      return;
    }

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    console.log("ATTENDANCE AUTH CHECK", {
      currentUserId: currentUser?.id ?? null,
      studentProfileId: student.profile_id,
      profileMatches:
        currentUser?.id === student.profile_id,
      studentId: student.id,
      tripId: qrToken.trip_id,
    });

    const now = new Date().toISOString();

    console.log("ATTENDANCE INSERT DEBUG", {
      authUserId: user.id,
      studentId: student.id,
      profileId: student.profile_id,
      tripId: qrToken.trip_id,
      busId: student.bus_id,
    });

    // Do not select the inserted row: the student may not have SELECT access
    // on attendance, even when the INSERT itself is allowed.
    const { error: attendanceError } = await supabase
      .from("attendance")
      .insert({
        student_id: student.id,
        trip_id: qrToken.trip_id,
        attendance_status: "present",
        boarding_time: now,
        scan_time: now,
      });

    if (attendanceError) {
      console.error("ATTENDANCE INSERT ERROR", {
        code: attendanceError.code,
        message: attendanceError.message,
        details: attendanceError.details,
        hint: attendanceError.hint,
      });

      if (attendanceError.code === "23505") {
        setMessage("Attendance already marked for this trip.");
      } else if (attendanceError.code === "42501") {
        setMessage(
          "Database security policy rejected attendance. Please check the attendance INSERT policy and authenticated user."
        );
      } else {
        setMessage(
          "Attendance failed: " +
            attendanceError.message +
            " (Code: " +
            attendanceError.code +
            ")"
        );
      }
      return;
    }

    // Attendance is already inserted. If token update fails, report that
    // separately so the user is not told the attendance insert failed.
    const { data: updatedToken, error: tokenUpdateError } = await supabase
      .from("bus_attendance_qr_tokens")
      .update({
        used_at: now,
        used_by_student_id: student.id,
      })
      .eq("id", qrToken.id)
      .is("used_at", null)
      .select("id")
      .maybeSingle();

    if (tokenUpdateError) {
      console.error("QR token update error:", tokenUpdateError);
      setMessage(
        "Attendance was recorded, but the QR status could not be updated. Please notify the administrator."
      );
      return;
    }

    if (!updatedToken) {
      setMessage(
        "Attendance was recorded, but this QR was already used or could not be reserved. Please notify the administrator."
      );
      return;
    }

    setMessage(
      "Attendance marked successfully for " + student.register_number + "!"
    );
  }

return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 text-center">
        Scan Bus QR
      </h1>

      <p className="mt-2 text-sm text-slate-500 text-center">
        Scan the QR displayed by the driver
      </p>

      <div
        id="bus-qr-reader"
        className="mt-6 min-h-[320px] w-full overflow-hidden rounded-xl border-2 border-slate-300 bg-black"
        style={{ minHeight: "320px" }}
      />

      {scanning && !processing && (
        <p className="mt-4 text-center text-sm text-blue-600">
          Point your camera at the bus QR...
        </p>
      )}

      {processing && (
        <p className="mt-4 text-center text-sm text-blue-600">
          Validating attendance...
        </p>
      )}

      {message && (
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-center text-sm font-medium text-slate-700">
          {message}
        </div>
      )}
    </div>
  </div>
);
}
