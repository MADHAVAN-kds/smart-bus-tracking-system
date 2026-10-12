import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

export default function AddBus() {
  const navigate = useNavigate();

  const [busNumber, setBusNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);

  async function handleAddBus(e: React.FormEvent) {
    e.preventDefault();

    if (!busNumber || !registrationNumber || !capacity) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("buses")
      .insert({
        bus_number: busNumber,
        registration_number: registrationNumber,
        capacity: Number(capacity),
        status: status,
      });

    setLoading(false);

    if (error) {
      console.error("Add bus error:", error);
      alert(error.message);
      return;
    }

    alert("Bus added successfully! 🚌");

    navigate("/buses");
  }

  return (
    <AppLayout>

      <div className="max-w-3xl">

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Add New Bus
          </h1>

          <p className="text-slate-500 mt-2">
            Register a new bus into the SmartBus system.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleAddBus}
          className="bg-white rounded-2xl shadow-md p-8"
        >

          {/* Bus Number */}
          <div className="mb-6">

            <label className="block text-sm font-semibold mb-2">
              Bus Number *
            </label>

            <input
              type="text"
              placeholder="Example: BUS-01"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Registration Number */}
          <div className="mb-6">

            <label className="block text-sm font-semibold mb-2">
              Registration Number *
            </label>

            <input
              type="text"
              placeholder="Example: TN-22-AB-1234"
              value={registrationNumber}
              onChange={(e) =>
                setRegistrationNumber(e.target.value)
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Capacity */}
          <div className="mb-6">

            <label className="block text-sm font-semibold mb-2">
              Seating Capacity *
            </label>

            <input
              type="number"
              min="1"
              placeholder="Example: 50"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Status */}
          <div className="mb-8">

            <label className="block text-sm font-semibold mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

          {/* Buttons */}
          <div className="flex gap-4">

            <button
              type="button"
              onClick={() => navigate("/buses")}
              className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Bus"}
            </button>

          </div>

        </form>

      </div>

    </AppLayout>
  );
}