import { useEffect, useState } from "react";
import {
  CalendarCheck,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type AttendanceRecord = {
  id: string;
  student_id: string;
  trip_id: string;
  attendance_status: string;
  boarding_time: string | null;
  exit_time: string | null;
  scan_time: string | null;
  student: {
    register_number: string;
    profile: {
      full_name: string;
    } | null;
  } | null;
  trip: {
    trip_date: string;
    trip_status: string;
    bus: {
      bus_number: string;
    } | null;
  } | null;
};

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAttendance() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          student_id,
          trip_id,
          attendance_status,
          boarding_time,
          exit_time,
          scan_time,

          student:students (
            register_number,
            profile:profiles (
              full_name
            )
          ),

          trip:trips (
            trip_date,
            trip_status,
            bus:buses (
              bus_number
            )
          )
        `)
        .order("scan_time", { ascending: false });

      if (error) {
        throw error;
      }

      setRecords((data as unknown as AttendanceRecord[]) || []);
    } catch (err: any) {
      console.error("Attendance fetch error:", err);
      setError(
        err?.message || "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchAttendance();

    const intervalId = window.setInterval(() => {
      void fetchAttendance();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const totalAttendance = records.length;

  const presentCount = records.filter(
    (record) => record.attendance_status === "present"
  ).length;

  const todayCount = records.filter((record) => {
    if (!record.scan_time) return false;

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const scanDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(record.scan_time));

    return today === scanDate;
  }).length;

  function formatDateTime(value: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Attendance Records
            </h1>

            <p className="mt-1 text-slate-500">
              View student bus attendance and boarding records.
            </p>
          </div>

          <button
            onClick={fetchAttendance}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Attendance
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalAttendance}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Users size={24} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Present
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle size={24} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Today's Attendance
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {todayCount}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <CalendarCheck size={24} />
              </div>

            </div>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Attendance records generated through QR scanning.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center gap-3 text-slate-500">
                <RefreshCw
                  size={20}
                  className="animate-spin"
                />
                Loading attendance...
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center">

              <CalendarCheck
                size={48}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-slate-700">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Attendance will appear here after students scan the bus QR.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Register No.
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bus
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Boarding Time
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Scan Time
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {records.map((record) => (

                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-slate-900">
                          {record.student?.profile?.full_name ||
                            "Unknown Student"}
                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                          {record.student?.register_number || "-"}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {record.trip?.bus?.bus_number || "-"}
                      </td>

                      <td className="px-6 py-4">

                        {record.attendance_status === "present" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                            <CheckCircle size={14} />
                            PRESENT
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                            ABSENT
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock size={16} className="text-slate-400" />
                          {formatDateTime(record.boarding_time)}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateTime(record.scan_time)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </AppLayout>
  );
}