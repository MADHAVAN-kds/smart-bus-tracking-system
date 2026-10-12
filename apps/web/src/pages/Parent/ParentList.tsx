import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  UserRound,
  GraduationCap,
  Phone,
  Mail,
  AlertCircle,
  Users,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Parent = {
  id: string;
  profile_id: string;
  student_id: string | null;
  relationship: string | null;
  address: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type Student = {
  id: string;
  register_number: string;
  department: string | null;
  year: number | null;
  section: string | null;
};

type ParentRow = {
  parent: Parent;
  profile: Profile | null;
  student: Student | null;
};

export default function ParentList() {
  const navigate = useNavigate();

  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] =
    useState("all");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // =========================================================
  // FETCH PARENTS
  // =========================================================

  async function fetchParents() {
    setLoading(true);
    setError("");

    try {
      // -------------------------------------------------------
      // 1. Get parent records
      // -------------------------------------------------------

      const { data: parentData, error: parentError } =
        await supabase
          .from("parents")
          .select(
            "id, profile_id, student_id, relationship, address"
          )
          .order("id", { ascending: false });

      if (parentError) {
        throw parentError;
      }

      if (!parentData || parentData.length === 0) {
        setParents([]);
        return;
      }

      // -------------------------------------------------------
      // 2. Get profile IDs
      // -------------------------------------------------------

      const profileIds = parentData
        .map((parent) => parent.profile_id)
        .filter(Boolean);

      // -------------------------------------------------------
      // 3. Get student IDs
      // -------------------------------------------------------

      const studentIds = parentData
        .map((parent) => parent.student_id)
        .filter(Boolean) as string[];

      // -------------------------------------------------------
      // 4. Fetch profiles
      // -------------------------------------------------------

      let profiles: Profile[] = [];

      if (profileIds.length > 0) {
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, phone"
            )
            .in("id", profileIds);

        if (profileError) {
          throw profileError;
        }

        profiles = profileData || [];
      }

      // -------------------------------------------------------
      // 5. Fetch students
      // -------------------------------------------------------

      let students: Student[] = [];

      if (studentIds.length > 0) {
        const { data: studentData, error: studentError } =
          await supabase
            .from("students")
            .select(
              "id, register_number, department, year, section"
            )
            .in("id", studentIds);

        if (studentError) {
          throw studentError;
        }

        students = studentData || [];
      }

      // -------------------------------------------------------
      // 6. Combine the data
      // -------------------------------------------------------

      const rows: ParentRow[] = parentData.map(
        (parent) => ({
          parent,
          profile:
            profiles.find(
              (profile) =>
                profile.id === parent.profile_id
            ) || null,

          student:
            students.find(
              (student) =>
                student.id === parent.student_id
            ) || null,
        })
      );

      setParents(rows);
    } catch (err: any) {
      console.error(
        "Failed to fetch parents:",
        err
      );

      setError(
        err?.message ||
          "Unable to load parents."
      );

      setParents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchParents();
  }, []);

  // =========================================================
  // DELETE PARENT
  // =========================================================

  async function handleDelete(row: ParentRow) {
    const parentName =
      row.profile?.full_name || "this parent";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${parentName}?`
    );

    if (!confirmed) return;

    setDeletingId(row.parent.id);

    try {
      // Delete parent record first
      const { error: parentError } =
        await supabase
          .from("parents")
          .delete()
          .eq("id", row.parent.id);

      if (parentError) {
        throw parentError;
      }

      // Delete linked profile
      if (row.parent.profile_id) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .delete()
            .eq(
              "id",
              row.parent.profile_id
            );

        if (profileError) {
          console.warn(
            "Parent deleted, but profile deletion failed:",
            profileError.message
          );
        }
      }

      alert("Parent deleted successfully!");

      await fetchParents();
    } catch (err: any) {
      console.error(
        "Delete parent error:",
        err
      );

      alert(
        err?.message ||
          "Failed to delete parent."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredParents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return parents.filter((row) => {
      const name =
        row.profile?.full_name
          ?.toLowerCase() || "";

      const email =
        row.profile?.email
          ?.toLowerCase() || "";

      const phone =
        row.profile?.phone
          ?.toLowerCase() || "";

      const registerNumber =
        row.student?.register_number
          ?.toLowerCase() || "";

      const relationship =
        row.parent.relationship
          ?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue) ||
        registerNumber.includes(searchValue) ||
        relationship.includes(searchValue);

      const matchesRelationship =
        relationshipFilter === "all" ||
        row.parent.relationship ===
          relationshipFilter;

      return (
        matchesSearch &&
        matchesRelationship
      );
    });
  }, [
    parents,
    search,
    relationshipFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalParents = parents.length;

  const fatherCount = parents.filter(
    (row) =>
      row.parent.relationship === "father"
  ).length;

  const motherCount = parents.filter(
    (row) =>
      row.parent.relationship === "mother"
  ).length;

  const guardianCount = parents.filter(
    (row) =>
      row.parent.relationship === "guardian"
  ).length;

  // =========================================================
  // RELATIONSHIP LABEL
  // =========================================================

  function relationshipLabel(
    relationship: string | null
  ) {
    if (!relationship) return "Not specified";

    return (
      relationship.charAt(0).toUpperCase() +
      relationship.slice(1)
    );
  }

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
              Parents
            </h1>

            <p className="text-slate-500 mt-1">
              Manage parent accounts and student
              relationships.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={fetchParents}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              onClick={() =>
                navigate("/parents/add")
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={18} />

              Add Parent
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Total */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Parents
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalParents}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users
                  size={22}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          {/* Fathers */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Fathers
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {fatherCount}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <UserRound
                  size={22}
                  className="text-indigo-600"
                />
              </div>

            </div>
          </div>

          {/* Mothers */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Mothers
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {motherCount}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center">
                <UserRound
                  size={22}
                  className="text-pink-600"
                />
              </div>

            </div>
          </div>

          {/* Guardians */}

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Guardians
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {guardianCount}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <UserRound
                  size={22}
                  className="text-amber-600"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}

          <div className="px-6 py-5 border-b border-slate-200">

            <h2 className="text-xl font-bold text-slate-900">
              Registered Parents
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View and manage all parent accounts.
            </p>

          </div>

          {/* ================================================= */}
          {/* FILTER BAR */}
          {/* ================================================= */}

          <div className="p-5 border-b border-slate-200 bg-slate-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Search */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search parent or student..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* Relationship */}

              <select
                value={relationshipFilter}
                onChange={(e) =>
                  setRelationshipFilter(
                    e.target.value
                  )
                }
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  All Relationships
                </option>

                <option value="father">
                  Father
                </option>

                <option value="mother">
                  Mother
                </option>

                <option value="guardian">
                  Guardian
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
                Loading parents...
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
                Failed to load parents
              </h3>

              <p className="text-sm text-red-500 mt-1">
                {error}
              </p>

              <button
                onClick={fetchParents}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Try Again
              </button>

            </div>

          ) : filteredParents.length === 0 ? (

            /* ================================================= */
            /* EMPTY */
            /* ================================================= */

            <div className="p-12 text-center">

              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">

                <Users
                  size={26}
                  className="text-slate-400"
                />

              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No parents found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search or filter.
              </p>

              {parents.length === 0 && (
                <button
                  onClick={() =>
                    navigate("/parents/add")
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Parent
                </button>
              )}

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
                      Parent
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Relationship
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredParents.map(
                    (row) => {

                      const profile =
                        row.profile;

                      const student =
                        row.student;

                      return (
                        <tr
                          key={row.parent.id}
                          className="hover:bg-slate-50 transition"
                        >

                          {/* Parent */}

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
                                    "Unknown Parent"}
                                </p>

                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">

                                  <Mail size={13} />

                                  <span className="truncate max-w-[220px]">
                                    {profile?.email ||
                                      "-"}
                                  </span>

                                </div>

                              </div>

                            </div>

                          </td>

                          {/* Relationship */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                row.parent.relationship ===
                                "father"
                                  ? "bg-blue-50 text-blue-700"
                                  : row.parent.relationship ===
                                    "mother"
                                  ? "bg-pink-50 text-pink-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {relationshipLabel(
                                row.parent.relationship
                              )}
                            </span>

                          </td>

                          {/* Student */}

                          <td className="px-6 py-5">

                            {student ? (

                              <div className="flex items-center gap-2">

                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">

                                  <GraduationCap
                                    size={17}
                                    className="text-indigo-600"
                                  />

                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-900">
                                    {
                                      student.register_number
                                    }
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {student.department ||
                                      "Department N/A"}

                                    {student.year
                                      ? ` • Year ${student.year}`
                                      : ""}
                                  </p>

                                </div>

                              </div>

                            ) : (

                              <span className="text-sm text-slate-400">
                                No student linked
                              </span>

                            )}

                          </td>

                          {/* Contact */}

                          <td className="px-6 py-5">

                            <div className="space-y-1">

                              {profile?.phone ? (
                                <div className="flex items-center gap-2 text-sm text-slate-700">

                                  <Phone
                                    size={14}
                                    className="text-slate-400"
                                  />

                                  {profile.phone}

                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  No phone
                                </span>
                              )}

                            </div>

                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/parents/edit/${row.parent.id}`
                                  )
                                }
                                title="Edit parent"
                                className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-center"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(row)
                                }
                                disabled={
                                  deletingId ===
                                  row.parent.id
                                }
                                title="Delete parent"
                                className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center disabled:opacity-50"
                              >
                                {deletingId ===
                                row.parent.id ? (
                                  <RefreshCw
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={16}
                                  />
                                )}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            filteredParents.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">

                <p className="text-sm text-slate-500">

                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredParents.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {parents.length}
                  </span>{" "}
                  parents

                </p>

              </div>
            )}

        </div>

      </div>
    </AppLayout>
  );
}