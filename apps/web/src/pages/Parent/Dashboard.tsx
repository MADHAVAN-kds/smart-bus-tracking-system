import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  UserRound,
  GraduationCap,
  Link2,
  AlertTriangle,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type Student = {
  id: string;
  register_number: string;
  department: string | null;
  year: number | null;
  section: string | null;
};

type Parent = {
  id: string;
  profile_id: string;
  student_id: string | null;
  relationship: string | null;
  address: string | null;
  created_at: string | null;

  profile: Profile | null;
  student: Student | null;
};

export default function ParentDashboard() {
  const navigate = useNavigate();

  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] =
    useState("all");

  // =====================================================
  // FETCH PARENTS
  // =====================================================

  async function fetchParents() {
    setLoading(true);
    setError("");

    try {
      // -------------------------------------------------
      // 1. Fetch parents
      // -------------------------------------------------

      const {
        data: parentData,
        error: parentError,
      } = await supabase
        .from("parents")
        .select(
          "id, profile_id, student_id, relationship, address, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (parentError) {
        throw new Error(parentError.message);
      }

      const rawParents = parentData || [];

      // No parents
      if (rawParents.length === 0) {
        setParents([]);
        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // 2. Get profile IDs
      // -------------------------------------------------

      const profileIds = rawParents
        .map((parent) => parent.profile_id)
        .filter(Boolean);

      // -------------------------------------------------
      // 3. Get student IDs
      // -------------------------------------------------

      const studentIds = rawParents
        .map((parent) => parent.student_id)
        .filter(Boolean) as string[];

      // -------------------------------------------------
      // 4. Fetch profiles
      // -------------------------------------------------

      let profiles: Profile[] = [];

      if (profileIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", profileIds);

        if (profileError) {
          throw new Error(profileError.message);
        }

        profiles = profileData || [];
      }

      // -------------------------------------------------
      // 5. Fetch students
      // -------------------------------------------------

      let students: Student[] = [];

      if (studentIds.length > 0) {
        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select(
            "id, register_number, department, year, section"
          )
          .in("id", studentIds);

        if (studentError) {
          throw new Error(studentError.message);
        }

        students = studentData || [];
      }

      // -------------------------------------------------
      // 6. Combine the data
      // -------------------------------------------------

      const combinedParents: Parent[] = rawParents.map(
        (parent) => {
          const profile =
            profiles.find(
              (item) => item.id === parent.profile_id
            ) || null;

          const student =
            students.find(
              (item) => item.id === parent.student_id
            ) || null;

          return {
            id: parent.id,
            profile_id: parent.profile_id,
            student_id: parent.student_id,
            relationship: parent.relationship,
            address: parent.address,
            created_at: parent.created_at,
            profile,
            student,
          };
        }
      );

      console.log(
        "Parents loaded successfully:",
        combinedParents
      );

      setParents(combinedParents);
    } catch (err: any) {
      console.error("Failed to load parents:", err);

      setParents([]);

      setError(
        err?.message ||
          "Unable to load parent information."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchParents();
  }, []);

  // =====================================================
  // DELETE PARENT
  // =====================================================

  async function deleteParent(id: string) {
    const parent = parents.find(
      (item) => item.id === id
    );

    const parentName =
      parent?.profile?.full_name ||
      "this parent";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${parentName}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("parents")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Parent deleted successfully.");

    fetchParents();
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const searchValue =
        search.toLowerCase().trim();

      const name =
        parent.profile?.full_name
          ?.toLowerCase() || "";

      const email =
        parent.profile?.email
          ?.toLowerCase() || "";

      const phone =
        parent.profile?.phone
          ?.toLowerCase() || "";

      const registerNumber =
        parent.student?.register_number
          ?.toLowerCase() || "";

      const relationship =
        parent.relationship
          ?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue) ||
        registerNumber.includes(searchValue);

      const matchesRelationship =
        relationshipFilter === "all" ||
        relationship === relationshipFilter;

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

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalParents = parents.length;

  const linkedParents = parents.filter(
    (parent) =>
      parent.student_id !== null
  ).length;

  const unlinkedParents =
    parents.filter(
      (parent) =>
        parent.student_id === null
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            flex flex-col gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
              "
            >
              Parents
            </h1>

            <p
              className="
                text-slate-500
                mt-1
              "
            >
              Manage parent accounts and student relationships.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={fetchParents}
              disabled={loading}
              className="
                flex items-center gap-2
                px-4 py-3
                rounded-lg
                border border-slate-300
                bg-white
                text-slate-700
                hover:bg-slate-50
                transition
                disabled:opacity-50
              "
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
              className="
                flex items-center gap-2
                px-4 py-3
                rounded-lg
                bg-blue-600
                text-white
                hover:bg-blue-700
                shadow-sm
                transition
              "
            >
              <UserPlus size={18} />

              Add Parent
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
          "
        >

          {/* TOTAL */}

          <div
            className="
              bg-white
              rounded-xl
              border border-slate-200
              shadow-sm
              p-5
            "
          >
            <div
              className="
                flex items-center
                justify-between
              "
            >
              <div>
                <p className="text-sm text-slate-500">
                  Total Parents
                </p>

                <h2
                  className="
                    text-3xl
                    font-bold
                    text-slate-900
                    mt-2
                  "
                >
                  {totalParents}
                </h2>
              </div>

              <div
                className="
                  w-11 h-11
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                  flex items-center
                  justify-center
                "
              >
                <Users size={22} />
              </div>
            </div>
          </div>

          {/* LINKED */}

          <div
            className="
              bg-white
              rounded-xl
              border border-slate-200
              shadow-sm
              p-5
            "
          >
            <div
              className="
                flex items-center
                justify-between
              "
            >
              <div>
                <p className="text-sm text-slate-500">
                  Linked to Student
                </p>

                <h2
                  className="
                    text-3xl
                    font-bold
                    text-slate-900
                    mt-2
                  "
                >
                  {linkedParents}
                </h2>
              </div>

              <div
                className="
                  w-11 h-11
                  rounded-lg
                  bg-green-50
                  text-green-600
                  flex items-center
                  justify-center
                "
              >
                <Link2 size={22} />
              </div>
            </div>
          </div>

          {/* UNLINKED */}

          <div
            className="
              bg-white
              rounded-xl
              border border-slate-200
              shadow-sm
              p-5
            "
          >
            <div
              className="
                flex items-center
                justify-between
              "
            >
              <div>
                <p className="text-sm text-slate-500">
                  Unlinked Parents
                </p>

                <h2
                  className="
                    text-3xl
                    font-bold
                    text-slate-900
                    mt-2
                  "
                >
                  {unlinkedParents}
                </h2>
              </div>

              <div
                className="
                  w-11 h-11
                  rounded-lg
                  bg-amber-50
                  text-amber-600
                  flex items-center
                  justify-center
                "
              >
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* ================================================= */}
        {/* SEARCH + FILTER */}
        {/* ================================================= */}

        <div
          className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-4
          "
        >
          <div
            className="
              flex flex-col
              md:flex-row
              gap-3
            "
          >

            <div className="relative flex-1">

              <Search
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Search by parent, phone, email or register number..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  pl-10 pr-4 py-3
                  rounded-lg
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  transition
                "
              />
            </div>

            <select
              value={relationshipFilter}
              onChange={(e) =>
                setRelationshipFilter(
                  e.target.value
                )
              }
              className="
                md:w-48
                px-4 py-3
                rounded-lg
                border border-slate-200
                bg-slate-50
                text-sm
                text-slate-700
                outline-none
                focus:bg-white
                focus:border-blue-500
              "
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
        {/* TABLE */}
        {/* ================================================= */}

        <div
          className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            overflow-hidden
          "
        >

          <div
            className="
              px-6 py-5
              border-b border-slate-200
            "
          >
            <div
              className="
                flex items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  Registered Parents
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Manage parent information and student links.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {filteredParents.length} parent
                {filteredParents.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (

            <div className="p-12 text-center">

              <RefreshCw
                size={24}
                className="
                  mx-auto
                  mb-3
                  animate-spin
                  text-blue-600
                "
              />

              <p className="text-slate-500">
                Loading parents...
              </p>

            </div>

          ) : error ? (

            <div className="p-12 text-center">

              <AlertTriangle
                size={30}
                className="
                  mx-auto
                  mb-3
                  text-red-500
                "
              />

              <p
                className="
                  font-medium
                  text-red-600
                "
              >
                Failed to load parents
              </p>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                {error}
              </p>

              <button
                onClick={fetchParents}
                className="
                  mt-4
                  px-4 py-2
                  rounded-lg
                  bg-slate-900
                  text-white
                  text-sm
                  hover:bg-slate-800
                "
              >
                Try Again
              </button>

            </div>

          ) : filteredParents.length === 0 ? (

            <div className="p-12 text-center">

              <UserRound
                size={36}
                className="
                  mx-auto
                  mb-3
                  text-slate-300
                "
              />

              <p
                className="
                  font-medium
                  text-slate-700
                "
              >
                No parents found
              </p>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                {parents.length === 0
                  ? "No parent accounts have been registered yet."
                  : "Try changing your search or filter."}
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead
                  className="
                    bg-slate-50
                    border-b border-slate-200
                  "
                >
                  <tr>

                    <th className="table-header">
                      Parent
                    </th>

                    <th className="table-header">
                      Contact
                    </th>

                    <th className="table-header">
                      Relationship
                    </th>

                    <th className="table-header">
                      Student
                    </th>

                    <th className="table-header">
                      Address
                    </th>

                    <th className="table-header">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredParents.map(
                    (parent) => (

                      <tr
                        key={parent.id}
                        className="
                          hover:bg-slate-50
                          transition-colors
                        "
                      >

                        {/* PARENT */}

                        <td className="px-6 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                w-10 h-10
                                rounded-full
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                                shrink-0
                              "
                            >
                              <UserRound size={19} />
                            </div>

                            <div>

                              <p
                                className="
                                  font-semibold
                                  text-slate-900
                                "
                              >
                                {parent.profile
                                  ?.full_name ||
                                  "Unnamed Parent"}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                  mt-0.5
                                "
                              >
                                Parent ID:{" "}
                                {parent.id.slice(0, 8)}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-4">

                          <p
                            className="
                              text-sm
                              text-slate-700
                            "
                          >
                            {parent.profile?.phone ||
                              "-"}
                          </p>

                          <p
                            className="
                              text-xs
                              text-slate-500
                              mt-1
                            "
                          >
                            {parent.profile?.email ||
                              "-"}
                          </p>

                        </td>

                        {/* RELATIONSHIP */}

                        <td className="px-6 py-4">

                          {parent.relationship ? (

                            <span
                              className="
                                inline-flex
                                px-3 py-1.5
                                rounded-full
                                bg-blue-50
                                text-blue-700
                                text-xs
                                font-semibold
                                capitalize
                              "
                            >
                              {parent.relationship}
                            </span>

                          ) : (

                            <span
                              className="
                                text-sm
                                text-slate-400
                              "
                            >
                              Not specified
                            </span>

                          )}

                        </td>

                        {/* STUDENT */}

                        <td className="px-6 py-4">

                          {parent.student ? (

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <div
                                className="
                                  w-8 h-8
                                  rounded-lg
                                  bg-emerald-50
                                  text-emerald-600
                                  flex
                                  items-center
                                  justify-center
                                "
                              >
                                <GraduationCap size={16} />
                              </div>

                              <div>

                                <p
                                  className="
                                    text-sm
                                    font-medium
                                    text-slate-800
                                  "
                                >
                                  {
                                    parent.student
                                      .register_number
                                  }
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  {
                                    parent.student
                                      .department ||
                                    "Department"
                                  }

                                  {parent.student.year
                                    ? ` · Year ${parent.student.year}`
                                    : ""}
                                </p>

                              </div>

                            </div>

                          ) : (

                            <span
                              className="
                                text-sm
                                text-amber-600
                                font-medium
                              "
                            >
                              Not linked
                            </span>

                          )}

                        </td>

                        {/* ADDRESS */}

                        <td
                          className="
                            px-6 py-4
                            text-sm
                            text-slate-600
                            max-w-xs
                          "
                        >
                          <span className="line-clamp-2">
                            {parent.address || "-"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <button
                              onClick={() =>
                                navigate(
                                  `/parents/edit/${parent.id}`
                                )
                              }
                              title="Edit parent"
                              className="
                                w-10 h-10
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                border border-slate-200
                                bg-white
                                text-slate-500
                                hover:bg-blue-50
                                hover:text-blue-600
                                hover:border-blue-200
                                transition-all
                                duration-200
                              "
                            >
                              <Pencil
                                size={18}
                                strokeWidth={2}
                              />
                            </button>

                            <button
                              onClick={() =>
                                deleteParent(
                                  parent.id
                                )
                              }
                              title="Delete parent"
                              className="
                                w-10 h-10
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                border border-slate-200
                                bg-white
                                text-slate-500
                                hover:bg-red-50
                                hover:text-red-600
                                hover:border-red-200
                                transition-all
                                duration-200
                              "
                            >
                              <Trash2
                                size={18}
                                strokeWidth={2}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </AppLayout>
  );
}