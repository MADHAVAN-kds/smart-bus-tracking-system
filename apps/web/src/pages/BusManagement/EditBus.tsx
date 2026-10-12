import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

export default function EditBus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [busNumber, setBusNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBus();
  }, []);

  async function fetchBus() {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setBusNumber(data.bus_number);
    setRegistrationNumber(data.registration_number);
    setCapacity(String(data.capacity));
    setStatus(data.status);
  }

  async function handleUpdateBus(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase
      .from("buses")
      .update({
        bus_number: busNumber,
        registration_number: registrationNumber,
        capacity: Number(capacity),
        status: status,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Bus updated successfully!");

    navigate("/buses");
  }

  return (
    <AppLayout>
      <div className="max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Edit Bus
          </h1>

          <p className="text-slate-500 mt-2">
            Update bus information.
          </p>
        </div>

        <form
          onSubmit={handleUpdateBus}
          className="bg-white rounded-2xl shadow-md p-8"
        >

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Bus Number
            </label>

            <input
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Registration Number
            </label>

            <input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Capacity
            </label>

            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-4">

            <button
              type="button"
              onClick={() => navigate("/buses")}
              className="px-6 py-3 border rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              {loading ? "Updating..." : "Update Bus"}
            </button>

          </div>

        </form>

      </div>
    </AppLayout>
  );
}