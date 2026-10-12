import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Hash,
  GraduationCap,
  Layers3,
  ShieldAlert,
  Bus,
  ArrowLeft,
  Save,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type BusType = {
  id: string;
  bus_number: string;
};

export default function AddStudent() {
  const navigate = useNavigate();

  // Student details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [registerNumber, setRegisterNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const [emergencyContact, setEmergencyContact] = useState("");
  const [busId, setBusId] = useState("");

  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(true);

  // =========================================================
  // FETCH ACTIVE BUSES
  // =========================================================

  useEffect(() => {
    fetchBuses();
  }, []);

  async function fetchBuses() {
    setBusLoading(true);

    const { data, error } = await supabase
      .from("buses")
      .select("id, bus_number")
      .eq("status", "active")
      .order("bus_number", { ascending: true });

    if (error) {
      console.error("Bus fetch error:", error);
      alert(error.message);
      setBusLoading(false);
      return;
    }

    setBuses(data || []);
    setBusLoading(false);
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    // Clean values
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanRegisterNumber =
      registerNumber.trim();
    const cleanSection = section.trim();
    const cleanEmergencyContact =
      emergencyContact.trim();

    // Required validation
    if (
      !cleanName ||
      !cleanEmail ||
      !cleanRegisterNumber ||
      !department ||
      !year
    ) {
      alert(
        "Please fill all required fields marked with *."
      );
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone validation if entered
    if (
      cleanPhone &&
      !/^[0-9+\-\s()]{7,15}$/.test(cleanPhone)
    ) {
      alert("Please enter a valid phone number.");
      return;
    }

    // Emergency contact validation if entered
    if (
      cleanEmergencyContact &&
      !/^[0-9+\-\s()]{7,15}$/.test(
        cleanEmergencyContact
      )
    ) {
      alert(
        "Please enter a valid emergency contact number."
      );
      return;
    }

    setLoading(true);

    try {
      // -----------------------------------------------------
      // Existing working Edge Function
      // -----------------------------------------------------

      const { data, error } =
        await supabase.functions.invoke(
          "create-student",
          {
            body: {
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              registerNumber:
                cleanRegisterNumber,
              department,
              year,
              section: cleanSection,
              emergencyContact:
                cleanEmergencyContact,
              busId: busId || null,
            },
          }
        );

      if (error) {
        console.error(
          "Create Student Error:",
          error
        );

        alert(error.message);
        return;
      }

      if (data?.error) {
        console.error(
          "Student Error:",
          data.error
        );

        alert(data.error);
        return;
      }

      alert("Student added successfully!");

      navigate("/students");
    } catch (error) {
      console.error(
        "Unexpected Student Error:",
        error
      );

      alert(
        "Something went wrong while adding the student."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // INPUT STYLE
  // =========================================================

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  // =========================================================
  // UI
  // =========================================================

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl">

        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div className="mb-6">

          <button
            type="button"
            onClick={() => navigate("/students")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Add Student
            </h1>

            <p className="mt-1 text-slate-500">
              Register a new student in the
              SmartBus system.
            </p>
          </div>

        </div>

        {/* ================================================= */}
        {/* FORM CARD */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >

          {/* ================================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================= */}

          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-2.5">
                <User
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500">
                  Basic student contact details
                </p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:px-8 md:grid-cols-2">

            {/* Name */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Student Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter student name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

            {/* Email */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

            {/* Phone */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

            {/* Emergency */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Emergency Contact
              </label>

              <div className="relative">

                <ShieldAlert
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  placeholder="Emergency contact number"
                  value={emergencyContact}
                  onChange={(e) =>
                    setEmergencyContact(
                      e.target.value
                    )
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* ACADEMIC INFORMATION */}
          {/* ================================================= */}

          <div className="border-y border-slate-200 px-6 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-indigo-50 p-2.5">
                <GraduationCap
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Academic Information
                </h2>

                <p className="text-sm text-slate-500">
                  Student registration and course details
                </p>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:px-8 md:grid-cols-2">

            {/* Register Number */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Register Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">

                <Hash
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter register number"
                  value={registerNumber}
                  onChange={(e) =>
                    setRegisterNumber(
                      e.target.value
                    )
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

            {/* Department */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className={selectClass}
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

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Year
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                className={selectClass}
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

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Section
              </label>

              <div className="relative">

                <Layers3
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Example: A"
                  value={section}
                  onChange={(e) =>
                    setSection(e.target.value)
                  }
                  className={`${inputClass} pl-11`}
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* TRANSPORT INFORMATION */}
          {/* ================================================= */}

          <div className="border-y border-slate-200 px-6 py-5 sm:px-8">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-emerald-50 p-2.5">
                <Bus
                  size={20}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Transport Information
                </h2>

                <p className="text-sm text-slate-500">
                  Assign the student to an active bus
                </p>
              </div>

            </div>

          </div>

          <div className="px-6 py-6 sm:px-8">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Assign Bus
            </label>

            <select
              value={busId}
              onChange={(e) =>
                setBusId(e.target.value)
              }
              disabled={busLoading}
              className={`${selectClass} md:max-w-md`}
            >

              <option value="">
                {busLoading
                  ? "Loading buses..."
                  : "No Bus / Assign Later"}
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

            <p className="mt-2 text-xs text-slate-500">
              Bus assignment is optional and can be
              updated later.
            </p>

          </div>

          {/* ================================================= */}
          {/* FOOTER ACTIONS */}
          {/* ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">

            <button
              type="button"
              onClick={() => navigate("/students")}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {loading
                ? "Saving..."
                : "Add Student"}
            </button>

          </div>

        </form>

      </div>
    </AppLayout>
  );
}