import { useEffect, useState } from "react";
import { ArrowLeft, QrCode, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type StudentInfo = {
  id: string;
  profile_id: string;
  register_number: string;
  department: string;
  year: number;
  section: string | null;
  qr_token: string;
};

export default function MyQRCode() {
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudent() {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------
      // GET LOGGED-IN USER
      // -----------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("No logged-in user found.");
      }

      console.log("Logged-in student user:", user.id);

      // -----------------------------------------
      // GET STUDENT PROFILE
      // -----------------------------------------

      const { data, error: studentError } = await supabase
        .from("students")
        .select(`
          id,
          profile_id,
          register_number,
          department,
          year,
          section,
          qr_token
        `)
        .eq("profile_id", user.id)
        .single();

      if (studentError) {
        throw new Error(studentError.message);
      }

      if (!data) {
        throw new Error("Student profile not found.");
      }

      setStudent(data);

      console.log("Student QR data:", data);
    } catch (err: any) {
      console.error("Student QR loading error:", err);

      setError(
        err?.message || "Unable to load student QR code."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudent();
  }, []);

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-slate-500">
              Loading your QR code...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // -----------------------------------------
  // ERROR
  // -----------------------------------------

  if (error || !student) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto mt-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">
              Unable to load QR Code
            </h2>

            <p className="text-sm text-red-600 mt-2">
              {error || "Student information not found."}
            </p>

            <button
              onClick={loadStudent}
              className="
                mt-5
                inline-flex items-center gap-2
                px-4 py-2
                rounded-lg
                bg-red-600
                text-white
                font-medium
                hover:bg-red-700
              "
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // -----------------------------------------
  // QR PAYLOAD
  // -----------------------------------------

  const qrValue = `SMARTBUS|${student.qr_token}`;

  // -----------------------------------------
  // MAIN UI
  // -----------------------------------------

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/student")}
            className="
              w-10 h-10
              rounded-lg
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-600
              hover:bg-slate-50
            "
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My QR Code
            </h1>

            <p className="text-slate-500 mt-1">
              Use this QR code for bus attendance.
            </p>
          </div>

        </div>

        {/* QR CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          <div className="text-center">

            {/* ICON */}
            <div className="
              w-14 h-14
              mx-auto
              rounded-2xl
              bg-blue-50
              flex
              items-center
              justify-center
            ">
              <QrCode
                size={28}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-4">
              Student Attendance QR
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Show this QR code to the driver when boarding
              and exiting the bus.
            </p>

            {/* QR CODE */}
            <div className="
              mt-8
              inline-flex
              p-6
              bg-white
              rounded-2xl
              border-2
              border-slate-200
              shadow-sm
            ">
              <QRCodeSVG
                value={qrValue}
                size={260}
                level="H"
                includeMargin
              />
            </div>

            {/* STUDENT DETAILS */}
            <div className="mt-8 space-y-3">

              <div className="
                inline-flex
                items-center
                justify-center
                px-5
                py-2
                rounded-full
                bg-blue-50
                text-blue-700
                font-semibold
              ">
                {student.register_number}
              </div>

              <p className="text-slate-700 font-medium">
                {student.department} • Year {student.year}
                {student.section
                  ? ` • Section ${student.section}`
                  : ""}
              </p>

            </div>

            {/* INSTRUCTIONS */}
            <div className="
              mt-8
              rounded-xl
              bg-slate-50
              border border-slate-200
              p-5
              text-left
            ">

              <h3 className="font-semibold text-slate-900">
                How to use
              </h3>

              <ul className="
                mt-3
                space-y-2
                text-sm
                text-slate-600
                list-disc
                pl-5
              ">
                <li>
                  Show this QR code to the bus driver.
                </li>

                <li>
                  First scan records your boarding time.
                </li>

                <li>
                  Second scan records your exit time.
                </li>

                <li>
                  Keep your QR code private.
                </li>
              </ul>

            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}