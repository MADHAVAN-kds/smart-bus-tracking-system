import { useEffect, useState } from "react";
import {
  Users,
  Bus,
  MapPinned,
  UserCheck,
  UserX,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Student = {
  id: string;
  profile_id: string;
  register_number: string;
  department: string;
  year: number;
  section: string | null;
  bus_id: string | null;
  route_id: string | null;
  emergency_contact: string | null;
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  async function fetchStudents() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        profile_id,
        register_number,
        department,
        year,
        section,
        bus_id,
        route_id,
        emergency_contact
      `)
      .order("created_at", { ascending: false });

    console.log("Student Dashboard:", data);
    console.log("Student Dashboard Error:", error);

    if (error) {
      setError(error.message);
      setStudents([]);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalStudents = students.length;

  const assignedBus = students.filter(
    (student) => student.bus_id !== null
  ).length;

  const unassignedBus = students.filter(
    (student) => student.bus_id === null
  ).length;

  const assignedRoutes = students.filter(
    (student) => student.route_id !== null
  ).length;

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Student Dashboard
            </h1>

            <p className="text-slate-500 mt-1">
              Overview of students registered in the SmartBus system.
            </p>
          </div>

          <button
            onClick={fetchStudents}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-2.5
              rounded-lg
              border border-slate-200
              bg-white
              text-slate-700
              font-medium
              hover:bg-slate-50
              transition
            "
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">
              Failed to load student data
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Total Students */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "—" : totalStudents}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  Registered students
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users
                  size={22}
                  className="text-blue-600"
                />
              </div>

            </div>

          </div>

          {/* Assigned Bus */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Bus Assigned
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "—" : assignedBus}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  Students with a bus
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Bus
                  size={22}
                  className="text-green-600"
                />
              </div>

            </div>

          </div>

          {/* Route Assigned */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Routes Assigned
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "—" : assignedRoutes}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  Students with routes
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <MapPinned
                  size={22}
                  className="text-purple-600"
                />
              </div>

            </div>

          </div>

          {/* Unassigned */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unassigned
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "—" : unassignedBus}
                </h2>

                <p className="text-xs text-slate-400 mt-2">
                  Students without a bus
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <UserX
                  size={22}
                  className="text-orange-600"
                />
              </div>

            </div>

          </div>

        </div>


{/* BUS ATTENDANCE SCANNER */}
<div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Bus Attendance
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Scan the driver's bus QR code to mark your attendance.
      </p>
    </div>

    <button
      onClick={() => navigate("/student/scan-bus-qr")}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      Open Scanner
      <ArrowRight size={18} />
    </button>
  </div>
</div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Manage Students */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <UserCheck
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-slate-900">
                  Manage Students
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  View, edit and manage all registered students.
                </p>

                <button
                  onClick={() => navigate("/students")}
                  className="
                    inline-flex items-center gap-2
                    mt-4
                    text-sm font-semibold
                    text-blue-600
                    hover:text-blue-700
                  "
                >
                  View Students
                  <ArrowRight size={16} />
                </button>

              </div>

            </div>

          </div>

          {/* Add Student */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Users
                  size={22}
                  className="text-green-600"
                />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-slate-900">
                  Register New Student
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Add a new student and assign a bus.
                </p>

                <button
                  onClick={() => navigate("/students/add")}
                  className="
                    inline-flex items-center gap-2
                    mt-4
                    text-sm font-semibold
                    text-green-600
                    hover:text-green-700
                  "
                >
                  Add Student
                  <ArrowRight size={16} />
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RECENT STUDENTS
        ================================================= */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Students
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Recently registered students.
              </p>
            </div>

            <button
              onClick={() => navigate("/students")}
              className="
                text-sm font-semibold
                text-blue-600
                hover:text-blue-700
              "
            >
              View All
            </button>

          </div>

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Loading students...
            </div>

          ) : students.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No students registered yet.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Register Number
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Department
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Year
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Section
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Bus
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Route
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  {students.slice(0, 5).map((student) => (

                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {student.register_number}
                        </span>
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                          {student.department}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.year}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {student.section || "-"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex px-3 py-1
                            rounded-full
                            text-sm font-medium
                            ${
                              student.bus_id
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {student.bus_id
                            ? "Assigned"
                            : "Not Assigned"}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex px-3 py-1
                            rounded-full
                            text-sm font-medium
                            ${
                              student.route_id
                                ? "bg-purple-50 text-purple-700"
                                : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {student.route_id
                            ? "Assigned"
                            : "Not Assigned"}
                        </span>

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
