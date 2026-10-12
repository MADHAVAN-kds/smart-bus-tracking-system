import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type BusData = {
  id: string;
  bus_number: string;
  registration_number: string;
  capacity: number;
  driver_id: string | null;
  route_id: string | null;
  status: string | null;
  created_at: string | null;
};

export default function BusManagement() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuses();
  }, []);

  async function fetchBuses() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Bus fetch error:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setBuses(data || []);
    setLoading(false);
  }

  return (
    <AppLayout>
      <div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Bus Management
            </h1>

            <p className="text-slate-500 mt-2">
              Manage and monitor all buses in the system.
            </p>
          </div>

          <button
            onClick={() => navigate("/buses/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition"
          >
            + Add Bus
          </button>

        </div>

        {/* Bus List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Bus Fleet
            </h2>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-8 text-center text-slate-500">
              Loading buses...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-8 text-center text-red-600">
              Failed to load buses: {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && buses.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No buses found.
            </div>
          )}

          {/* Table */}
          {!loading && !error && buses.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">
                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Bus Number
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Registration
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Capacity
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Driver
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Route
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {buses.map((bus) => (

                    <tr
                      key={bus.id}
                      className="border-t hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4 font-medium">
                        {bus.bus_number}
                      </td>

                      <td className="px-6 py-4">
                        {bus.registration_number}
                      </td>

                      <td className="px-6 py-4">
                        {bus.capacity}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {bus.driver_id || "Not Assigned"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {bus.route_id || "Not Assigned"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            bus.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {bus.status || "Unknown"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </AppLayout>
  );
}