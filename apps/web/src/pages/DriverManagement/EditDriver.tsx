import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Bus = {
  id: string;
  bus_number: string;
};

export default function EditDriver() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [busId, setBusId] = useState("");
  const [status, setStatus] = useState("active");

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDriver();
    fetchBuses();
  }, []);

  async function fetchBuses() {
    const { data } = await supabase
      .from("buses")
      .select("id,bus_number")
      .eq("status", "active");

    setBuses(data || []);
  }

  async function fetchDriver() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setName(data.name || "");
    setPhone(data.phone || "");
    setLicenseNumber(data.license_number || "");
    setLicenseExpiry(data.license_expiry || "");
    setBusId(data.bus_id || "");
    setStatus(data.status || "active");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase
      .from("drivers")
      .update({
        name,
        phone,
        license_number: licenseNumber,
        license_expiry: licenseExpiry,
        bus_id: busId || null,
        status,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Driver updated successfully!");

    navigate("/drivers");
  }

  return (
    <AppLayout>

      <div className="max-w-3xl">

        <h1 className="text-3xl font-bold mb-6">
          Edit Driver
        </h1>

        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-xl shadow p-8 space-y-5"
        >

          <input
            placeholder="Driver Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            placeholder="License Number"
            value={licenseNumber}
            onChange={(e)=>setLicenseNumber(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="date"
            value={licenseExpiry}
            onChange={(e)=>setLicenseExpiry(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <select
            value={busId}
            onChange={(e)=>setBusId(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >

            <option value="">
              Assign Bus
            </option>

            {buses.map((bus)=>(
              <option
                key={bus.id}
                value={bus.id}
              >
                {bus.bus_number}
              </option>
            ))}

          </select>

          <select
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={()=>navigate("/drivers")}
              className="px-6 py-3 border rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              {loading ? "Updating..." : "Update Driver"}
            </button>

          </div>

        </form>

      </div>

    </AppLayout>
  );
}