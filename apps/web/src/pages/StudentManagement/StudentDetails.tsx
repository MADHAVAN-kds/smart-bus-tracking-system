import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  BusFront,
  ShieldAlert,
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
  route_id: string | null;
  emergency_contact: string | null;
};

type Profile = {
  full_name: string;
  email: string;
  phone: string | null;
};

type Bus = {
  id: string;
  bus_number: string;
};

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    loadStudent();
  }, [id]);

  async function loadStudent() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      // Get student
      const { data: studentData, error: studentError } =
        await supabase
          .from("students")
          .select(
            `
            id,
            profile_id,
            register_number,
            department,
            year,
            section,
            bus_id,
            route_id,
            emergency_contact
            `
          )
          .eq("id", id)
          .single();

      if (studentError) {
        throw new Error(studentError.message);
      }

      const studentInfo = studentData as Student;

      setStudent(studentInfo);

      // Get profile
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", studentInfo.profile_id)
          .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setProfile(profileData as Profile);

      // Get bus if assigned
      if (studentInfo.bus_id) {
        const { data: busData, error: busError } =
          await supabase
            .from("buses")
            .select("id, bus_number")
            .eq("id", studentInfo.bus_id)
            .maybeSingle();

        if (!busError && busData) {
          setBus(busData as Bus);
        }
      }
    } catch (err) {
      console.error("Student details error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student details."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading student details...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !student || !profile) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldAlert size={26} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load student
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error || "Student information could not be found."}
            </p>

            <button
              onClick={() => navigate("/students")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft size={17} />
              Back to Students
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              onClick={() => navigate("/students")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Students
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Student Details
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View complete student information.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/students/edit/${student.id}`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Edit Student
          </button>

        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
              {profile.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.full_name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Register Number:{" "}
                <span className="font-semibold text-slate-700">
                  {student.register_number}
                </span>
              </p>
            </div>

          </div>

        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-xs text-slate-500">
                  Student contact details
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <InfoRow
                icon={<Mail size={17} />}
                label="Email"
                value={profile.email}
              />

              <InfoRow
                icon={<Phone size={17} />}
                label="Phone"
                value={profile.phone || "Not provided"}
              />

              <InfoRow
                icon={<ShieldAlert size={17} />}
                label="Emergency Contact"
                value={
                  student.emergency_contact ||
                  "Not provided"
                }
              />

            </div>

          </div>

          {/* Academic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <GraduationCap size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Academic Information
                </h2>

                <p className="text-xs text-slate-500">
                  Student academic details
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <InfoRow
                label="Register Number"
                value={student.register_number}
              />

              <InfoRow
                label="Department"
                value={student.department}
              />

              <InfoRow
                label="Year"
                value={`Year ${student.year}`}
              />

              <InfoRow
                label="Section"
                value={student.section || "Not provided"}
              />

            </div>

          </div>

          {/* Transport Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BusFront size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Transport Information
                </h2>

                <p className="text-xs text-slate-500">
                  SmartBus assignment details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <StatusBox
                label="Bus"
                value={bus ? bus.bus_number : "Not Assigned"}
                assigned={!!student.bus_id}
              />

              <StatusBox
                label="Route"
                value={
                  student.route_id
                    ? "Assigned"
                    : "Not Assigned"
                }
                assigned={!!student.route_id}
              />

              <StatusBox
                label="Bus Status"
                value={
                  student.bus_id
                    ? "Active Assignment"
                    : "No Assignment"
                }
                assigned={!!student.bus_id}
              />

            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

      {icon && (
        <div className="text-slate-400">
          {icon}
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>

    </div>
  );
}

function StatusBox({
  label,
  value,
  assigned,
}: {
  label: string;
  value: string;
  assigned: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        <span
          className={`h-2 w-2 rounded-full ${
            assigned
              ? "bg-emerald-500"
              : "bg-slate-400"
          }`}
        />

        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>

      </div>

    </div>
  );
}