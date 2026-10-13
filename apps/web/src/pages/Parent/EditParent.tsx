import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Users,
  MapPin,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
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

export default function EditParent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
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
    newPassword: "",
  });

  // =====================================================
  // LOAD PARENT
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError("Parent ID is missing.");
      setLoading(false);
      return;
    }

    loadParent();
    fetchStudents();
  }, [id]);

  async function loadParent() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      // Get parent record
      const { data: parent, error: parentError } =
        await supabase
          .from("parents")
          .select(
            "id, profile_id, student_id, relationship, address"
          )
          .eq("id", id)
          .maybeSingle();

      if (parentError) {
        throw new Error(parentError.message);
      }

      if (!parent) {
        throw new Error("Parent record not found.");
      }

      // Get profile
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .eq("id", parent.profile_id)
          .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (!profile) {
        throw new Error("Parent profile not found.");
      }

      setForm({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        relationship: parent.relationship || "",
        studentId: parent.student_id || "",
        address: parent.address || "",
        newPassword: "",
      });
    } catch (err: any) {
      console.error("Failed to load parent:", err);

      setError(
        err?.message ||
          "Unable to load parent information."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  async function fetchStudents() {
    const { data, error } = await supabase
      .from("students")
      .select(
        "id, register_number, department, year, section"
      )
      .order("register_number", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to load students:",
        error
      );

      setError("Unable to load students.");
      return;
    }

    setStudents(data || []);
  }

  // =====================================================
  // HANDLE INPUT
  // =====================================================

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

  // =====================================================
  // UPDATE PARENT
  // =====================================================

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError("Parent ID is missing.");
      return;
    }

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

    try {
      setSubmitting(true);

      const { data, error } =
        await supabase.functions.invoke(
          "update-parent",
          {
            body: {
              parent_id: id,
              full_name: form.fullName.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              relationship: form.relationship,
              student_id: form.studentId,
              address: form.address.trim(),
              new_password: form.newPassword?.trim() || undefined,
            },
          }
        );

      if (error) {
        console.error(
          "Update Parent Edge Function error:",
          error
        );

        let backendMessage = error.message;

        try {
          if (error.context) {
            const response =
              await error.context.json();

            console.error(
              "Backend response:",
              response
            );

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

      if (!data?.success) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to update parent."
        );
      }

      alert("Parent information updated successfully.");

      navigate("/parents");

    } catch (err: any) {
      console.error(
        "Update parent error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while updating the parent."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Loader2
              size={30}
              className="mx-auto mb-3 animate-spin text-blue-600"
            />

            <p className="text-slate-500">
              Loading parent information...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

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
              Edit Parent
            </h1>

            <p className="mt-1 text-slate-500">
              Update parent account and student relationship details.
            </p>
          </div>
        </div>

        {/* ERROR */}

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

        {/* SUCCESS */}

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

          {/* PARENT INFORMATION */}

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
                    Update the parent's account details.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}

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
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* EMAIL */}

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
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>


{/* NEW PASSWORD */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-700">
    New Password (Optional)
  </label>

  <input
    type="password"
    name="newPassword"
    value={form.newPassword}
    onChange={handleChange}
    placeholder="Enter new password"
    autoComplete="new-password"
    minLength={8}
    className="w-full h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />

  <p className="mt-1 text-xs text-slate-500">
    Leave blank to keep the current password.
  </p>
</div>


              {/* PHONE */}

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
                    className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* RELATIONSHIP */}

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

            </div>
          </div>

          {/* STUDENT */}

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
                    Update the student linked to this parent.
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
                  className="w-full h-11 rounded-lg border border-slate-200 pl-10 pr-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select student
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

          {/* ADDRESS */}

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

          {/* ACTIONS */}

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
              disabled={submitting}
              className="h-11 px-6 rounded-lg bg-blue-600 text-white font-medium flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
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
