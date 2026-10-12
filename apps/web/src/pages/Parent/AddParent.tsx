import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Users,
  MapPin,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Student = {
  id: string;
  register_number: string;
  department: string | null;
  year: number | null;
  section: string | null;
};

export default function AddParent() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    relationship: "",
    studentId: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoadingStudents(true);

    const { data, error } = await supabase
      .from("students")
      .select("id, register_number, department, year, section")
      .order("register_number", { ascending: true });

    if (error) {
      console.error("Failed to load students:", error);
      setError("Unable to load students.");
    } else {
      setStudents(data || []);
    }

    setLoadingStudents(false);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!form.fullName.trim()) {
      setError("Please enter the parent's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the parent's email.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter the parent's phone number.");
      return;
    }

    if (!form.relationship) {
      setError("Please select the relationship.");
      return;
    }

    if (!form.studentId) {
      setError("Please select a student.");
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase.functions.invoke(
        "create-parent",
        {
          body: {
            full_name: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            relationship: form.relationship,
            student_id: form.studentId,
            address: form.address.trim(),
            password: form.password,
          },
        }
      );

      // Handle Edge Function error
      if (error) {
        console.error("Edge Function error:", error);

        let backendMessage = error.message;

        try {
          if (error.context) {
            const response = await error.context.json();

            console.error("Backend response:", response);

            if (response?.error) {
              backendMessage = response.error;
            }
          }
        } catch (parseError) {
          console.error(
            "Could not parse backend error:",
            parseError
          );
        }

        throw new Error(backendMessage);
      }

      // Handle backend response
      if (!data?.success) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to create parent."
        );
      }

      // Success
      setSuccess("Parent account created successfully.");

      setForm({
        fullName: "",
        email: "",
        phone: "",
        relationship: "",
        studentId: "",
        address: "",
        password: "",
      });

      // Return to Parents page
      navigate("/parents");

    } catch (err: any) {
      console.error("Create parent error:", err);

      setError(
        err?.message ||
          "Something went wrong while creating the parent account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/parents")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft size={17} />
            Back to Parents
          </button>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-slate-900">
              Add Parent
            </h1>

            <p className="mt-1 text-slate-500">
              Create a parent account and link it to a student.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Parent Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Parent Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Enter the parent's account details.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="parent@example.com"
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Relationship{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="relationship"
                    value={form.relationship}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select relationship
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Login Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  The parent will use this password to access the portal.
                </p>
              </div>

            </div>
          </div>

          {/* Student Assignment */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <GraduationCap
                    size={20}
                    className="text-indigo-600"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Student Assignment
                  </h2>

                  <p className="text-sm text-slate-500">
                    Select the student associated with this parent.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Student{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <GraduationCap
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  disabled={loadingStudents}
                  className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingStudents
                      ? "Loading students..."
                      : students.length === 0
                      ? "No students available"
                      : "Select student"}
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.register_number}

                      {student.department
                        ? ` — ${student.department}`
                        : ""}

                      {student.year
                        ? ` — Year ${student.year}`
                        : ""}

                      {student.section
                        ? ` — Section ${student.section}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Student */}
              {form.studentId && (
                <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4">

                  {(() => {
                    const student = students.find(
                      (s) => s.id === form.studentId
                    );

                    if (!student) return null;

                    return (
                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <GraduationCap
                            size={19}
                            className="text-blue-600"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.register_number}
                          </p>

                          <p className="text-sm text-slate-500">
                            {student.department ||
                              "Department not specified"}

                            {student.year
                              ? ` • Year ${student.year}`
                              : ""}

                            {student.section
                              ? ` • Section ${student.section}`
                              : ""}
                          </p>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

            </div>
          </div>

          {/* Address */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MapPin
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Address
                  </h2>

                  <p className="text-sm text-slate-500">
                    Parent's residential address.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={4}
                placeholder="Enter complete address"
                className="w-full rounded-lg border border-slate-200 p-3 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate("/parents")}
              disabled={submitting}
              className="h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingStudents}
              className="h-11 px-6 rounded-lg bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Parent
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </AppLayout>
  );
}
