import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  UserRound,
  Bus as BusIcon,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

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
  emergency_contact: string | null;

  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;

  buses: {
    id: string;
    bus_number: string;
  } | null;
};

export default function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================================================
  // FETCH STUDENTS
  // =========================================================

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
        emergency_contact,

        profiles (
          full_name,
          email,
          phone
        ),

        buses (
          id,
          bus_number
        )
      `)
      .order("created_at", { ascending: false });

    console.log("Students:", data);
    console.log("Students Error:", error);

    if (error) {
      console.error(error);
      setError(error.message);
      setStudents([]);
    } else {
      setStudents((data as unknown as Student[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================================================
  // DELETE STUDENT
  // =========================================================

  async function handleDelete(student: Student) {
    const studentName =
      student.profiles?.full_name || "this student";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${studentName}?`
    );

    if (!confirmed) return;

    setDeletingId(student.id);

    try {
      // Delete student first
      const { error: studentError } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id);

      if (studentError) {
        throw studentError;
      }

      // Delete linked profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", student.profile_id);

      if (profileError) {
        console.warn(
          "Student deleted, but profile deletion failed:",
          profileError.message
        );
      }

      alert("Student deleted successfully!");

      await fetchStudents();
    } catch (err: any) {
      console.error(err);

      alert(
        err?.message ||
          "Failed to delete student."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // FILTER STUDENTS
  // =========================================================

  const filteredStudents = students.filter((student) => {
    const name =
      student.profiles?.full_name?.toLowerCase() || "";

    const email =
      student.profiles?.email?.toLowerCase() || "";

    const registerNumber =
      student.register_number?.toLowerCase() || "";

    const department =
      student.department?.toLowerCase() || "";

    const searchValue = search.toLowerCase();

    const matchesSearch =
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      registerNumber.includes(searchValue) ||
      department.includes(searchValue);

    const matchesDepartment =
      departmentFilter === "all" ||
      student.department === departmentFilter;

    const matchesYear =
      yearFilter === "all" ||
      String(student.year) === yearFilter;

    const matchesBus =
      busFilter === "all" ||
      (busFilter === "assigned"
        ? student.bus_id !== null
        : student.bus_id === null);

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesYear &&
      matchesBus
    );
  });

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalStudents = students.length;

  const assignedStudents = students.filter(
    (student) => student.bus_id !== null
  ).length;

  const unassignedStudents =
    totalStudents - assignedStudents;

  // =========================================================
  // UI
  // =========================================================

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Students
            </h1>

            <p className="text-slate-500 mt-1">
              Manage students, bus assignments and
              emergency information.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={fetchStudents}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <button
              onClick={() => navigate("/students/add")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={18} />

              Add Student
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* STAT CARDS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Total */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Students
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalStudents}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <UserRound
                  size={22}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          {/* Assigned */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Assigned to Bus
                </p>

                <h2 className="text-3xl font-bold text-emerald-600 mt-2">
                  {assignedStudents}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <BusIcon
                  size={22}
                  className="text-emerald-600"
                />
              </div>

            </div>
          </div>

          {/* Unassigned */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Unassigned
                </p>

                <h2 className="text-3xl font-bold text-orange-500 mt-2">
                  {unassignedStudents}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertCircle
                  size={22}
                  className="text-orange-500"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ================================================= */}
        {/* STUDENT MANAGEMENT */}
        {/* ================================================= */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Section Header */}

          <div className="px-6 py-5 border-b border-slate-200">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Registered Students
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                View and manage all registered students.
              </p>
            </div>

          </div>

          {/* ================================================= */}
          {/* FILTER BAR */}
          {/* ================================================= */}

          <div className="p-5 border-b border-slate-200 bg-slate-50">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Search */}

              <div className="relative lg:col-span-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* Department */}

              <select
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(e.target.value)
                }
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="all">
                  All Departments
                </option>

                <option value="CSE">
                  CSE
                </option>

                <option value="AI&DS">
                  AI & DS
                </option>

                <option value="ECE">
                  ECE
                </option>

                <option value="EEE">
                  EEE
                </option>

                <option value="MECH">
                  Mechanical
                </option>

                <option value="CIVIL">
                  Civil
                </option>

              </select>

              {/* Year */}

              <select
                value={yearFilter}
                onChange={(e) =>
                  setYearFilter(e.target.value)
                }
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="all">
                  All Years
                </option>

                <option value="1">
                  1st Year
                </option>

                <option value="2">
                  2nd Year
                </option>

                <option value="3">
                  3rd Year
                </option>

                <option value="4">
                  4th Year
                </option>

              </select>

              {/* Bus */}

              <select
                value={busFilter}
                onChange={(e) =>
                  setBusFilter(e.target.value)
                }
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="all">
                  All Bus Status
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="unassigned">
                  Unassigned
                </option>

              </select>

            </div>
          </div>

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (

            <div className="p-12 text-center">

              <RefreshCw
                size={28}
                className="mx-auto text-blue-600 animate-spin"
              />

              <p className="mt-3 text-slate-500">
                Loading students...
              </p>

            </div>

          ) : error ? (

            /* ================================================= */
            /* ERROR */
            /* ================================================= */

            <div className="p-12 text-center">

              <AlertCircle
                size={36}
                className="mx-auto text-red-500"
              />

              <h3 className="mt-3 font-semibold text-slate-900">
                Failed to load students
              </h3>

              <p className="text-sm text-red-500 mt-1">
                {error}
              </p>

              <button
                onClick={fetchStudents}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Try Again
              </button>

            </div>

          ) : filteredStudents.length === 0 ? (

            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="p-12 text-center">

              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <UserRound
                  size={26}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No students found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search or filters.
              </p>

            </div>

          ) : (

            /* ================================================= */
            /* TABLE */
            /* ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Register No.
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Year / Section
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bus
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Emergency
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStudents.map((student) => {

                    const profile =
                      student.profiles;

                    const bus =
                      student.buses;

                    return (

                      <tr
                        key={student.id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* Student */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <UserRound
                                size={21}
                                className="text-blue-600"
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-slate-900">
                                {profile?.full_name ||
                                  "Unknown Student"}
                              </p>

                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Mail size={13} />

                                <span className="truncate max-w-[180px]">
                                  {profile?.email || "-"}
                                </span>
                              </div>

                              {profile?.phone && (
                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                  <Phone size={13} />

                                  {profile.phone}
                                </div>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* Register */}

                        <td className="px-6 py-5">

                          <span className="font-semibold text-slate-900">
                            {student.register_number}
                          </span>

                        </td>

                        {/* Department */}

                        <td className="px-6 py-5">

                          <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {student.department}
                          </span>

                        </td>

                        {/* Year */}

                        <td className="px-6 py-5">

                          <div className="text-sm text-slate-700">
                            <span className="font-medium">
                              {student.year}
                              {student.year === 1
                                ? "st"
                                : student.year === 2
                                ? "nd"
                                : student.year === 3
                                ? "rd"
                                : "th"}{" "}
                              Year
                            </span>

                            {student.section && (
                              <span className="text-slate-400">
                                {" "}
                                / Section{" "}
                                {student.section}
                              </span>
                            )}
                          </div>

                        </td>

                        {/* Bus */}

                        <td className="px-6 py-5">

                          {bus ? (

                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">

                              <BusIcon size={14} />

                              {bus.bus_number}

                            </span>

                          ) : (

                            <span className="inline-flex px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                              Not Assigned
                            </span>

                          )}

                        </td>

                        {/* Emergency */}

                        <td className="px-6 py-5">

                          {student.emergency_contact ? (

                            <div className="flex items-center gap-2 text-sm text-slate-700">

                              <Phone
                                size={15}
                                className="text-slate-400"
                              />

                              {student.emergency_contact}

                            </div>

                          ) : (

                            <span className="text-sm text-slate-400">
                              Not provided
                            </span>

                          )}

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                navigate(
                                  `/students/edit/${student.id}`
                                )
                              }
                              title="Edit student"
                              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-center"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(student)
                              }
                              disabled={
                                deletingId ===
                                student.id
                              }
                              title="Delete student"
                              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center disabled:opacity-50"
                            >
                              {deletingId ===
                              student.id ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            filteredStudents.length > 0 && (

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">

                <p className="text-sm text-slate-500">

                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredStudents.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {students.length}
                  </span>{" "}
                  students

                </p>

              </div>
            )}

        </div>

      </div>
    </AppLayout>
  );
}