import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Bus as BusIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Bus = {
  id: string;
  bus_number: string;
};

type StudentData = {
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
};

export default function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // =====================================================
  // FORM STATE
  // =====================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [registerNumber, setRegisterNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const [emergencyContact, setEmergencyContact] = useState("");
  const [busId, setBusId] = useState("");

  // =====================================================
  // PAGE STATE
  // =====================================================

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    loadStudent();
    fetchBuses();
  }, [id]);

  // =====================================================
  // FETCH STUDENT
  // =====================================================

  async function loadStudent() {
    if (!id) return;

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
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Load student error:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    const student = {
      ...data,
      profiles: Array.isArray(data.profiles)
        ? data.profiles[0]
        : data.profiles,
    } as unknown as StudentData;

    console.log("Student loaded:", student);

    setName(student.profiles?.full_name || "");
    setEmail(student.profiles?.email || "");
    setPhone(student.profiles?.phone || "");

    setRegisterNumber(student.register_number || "");
    setDepartment(student.department || "");
    setYear(String(student.year || ""));
    setSection(student.section || "");

    setEmergencyContact(
      student.emergency_contact || ""
    );

    setBusId(student.bus_id || "");

    setLoading(false);
  }

  // =====================================================
  // FETCH BUSES
  // =====================================================

  async function fetchBuses() {
    const { data, error } = await supabase
      .from("buses")
      .select("id, bus_number")
      .eq("status", "active")
      .order("bus_number");

    if (error) {
      console.error("Bus loading error:", error);
      return;
    }

    setBuses(data || []);
  }

  // =====================================================
  // SAVE CHANGES
  // =====================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!id) {
      alert("Student ID is missing.");
      return;
    }

    // Required validation

    if (
      !name.trim() ||
      !email.trim() ||
      !registerNumber.trim() ||
      !department ||
      !year
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    setSaving(true);

    try {
      // =================================================
      // STEP 1 — UPDATE PROFILE
      // =================================================

      const { data: student, error: studentFetchError } =
        await supabase
          .from("students")
          .select("profile_id")
          .eq("id", id)
          .single();

      if (studentFetchError) {
        throw studentFetchError;
      }

      if (!student?.profile_id) {
        throw new Error(
          "This student does not have a linked profile."
        );
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            full_name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
          })
          .eq("id", student.profile_id);

      if (profileError) {
        throw profileError;
      }

      // =================================================
      // STEP 2 — UPDATE STUDENT
      // =================================================

      const { error: updateStudentError } =
        await supabase
          .from("students")
          .update({
            register_number:
              registerNumber.trim(),

            department,

            year: Number(year),

            section:
              section.trim() || null,

            bus_id:
              busId || null,

            emergency_contact:
              emergencyContact.trim() || null,
          })
          .eq("id", id);

      if (updateStudentError) {
        throw updateStudentError;
      }

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Student updated successfully!"
      );

      navigate("/students");

    } catch (err: any) {
      console.error(
        "Update student error:",
        err
      );

      alert(
        err?.message ||
          "Failed to update student."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={32}
              className="mx-auto text-blue-600 animate-spin"
            />

            <p className="mt-4 text-slate-500">
              Loading student information...
            </p>

          </div>

        </div>
      </AppLayout>
    );
  }

  // =====================================================
  // ERROR SCREEN
  // =====================================================

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">

          <div className="text-center max-w-md">

            <AlertCircle
              size={42}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load student
            </h2>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/students")
              }
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <ArrowLeft size={18} />

              Back to Students
            </button>

          </div>

        </div>
      </AppLayout>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <AppLayout>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() =>
              navigate("/students")
            }
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Edit Student
            </h1>

            <p className="text-slate-500 mt-1">
              Update student profile and
              transportation information.
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                  <UserRound
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic student contact details.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Student Name *
                </label>

                <div className="relative">

                  <UserRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter student name"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>

              </div>

              {/* Phone */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* ACADEMIC INFORMATION */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">

                  <GraduationCap
                    size={20}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Academic Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Student registration and
                    academic details.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Register Number */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Register Number *
                </label>

                <input
                  value={registerNumber}
                  onChange={(e) =>
                    setRegisterNumber(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 24AIDS001"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* Department */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department *
                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select Department
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

              </div>

              {/* Year */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year *
                </label>

                <select
                  value={year}
                  onChange={(e) =>
                    setYear(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select Year
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

              </div>

              {/* Section */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section
                </label>

                <input
                  value={section}
                  onChange={(e) =>
                    setSection(
                      e.target.value
                    )
                  }
                  placeholder="e.g. A"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* TRANSPORTATION */}
          {/* ================================================= */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">

                  <BusIcon
                    size={20}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Transportation
                  </h2>

                  <p className="text-sm text-slate-500">
                    Manage bus assignment and
                    emergency contact.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Bus */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assigned Bus
                </label>

                <div className="relative">

                  <BusIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={busId}
                    onChange={(e) =>
                      setBusId(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="">
                      No Bus Assigned
                    </option>

                    {buses.map((bus) => (
                      <option
                        key={bus.id}
                        value={bus.id}
                      >
                        {bus.bus_number}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              {/* Emergency */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emergency Contact
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={emergencyContact}
                    onChange={(e) =>
                      setEmergencyContact(
                        e.target.value
                      )
                    }
                    placeholder="Emergency phone number"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* ACTION BAR */}
          {/* ================================================= */}

          <div className="flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/students")
              }
              disabled={saving}
              className="px-5 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >

              {saving ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </AppLayout>
  );
}