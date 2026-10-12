import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  Users,
  AlertTriangle,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type BusData = {
  id: string;
  bus_number: string;
  registration_number: string;
  capacity: number;
  status: string | null;
};

export default function BusFleet() {
  const navigate = useNavigate();

  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // FETCH BUSES
  // =====================================================

  async function fetchBuses() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("buses")
      .select(
        "id, bus_number, registration_number, capacity, status"
      )
      .order("created_at", { ascending: false });

    console.log("Buses:", data);
    console.log("Buses Error:", error);

    if (error) {
      setError(error.message);
      setBuses([]);
    } else {
      setBuses(data || []);
    }

    setLoading(false);
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchBuses();
  }, []);

  // =====================================================
  // DELETE BUS
  // =====================================================

  async function handleDeleteBus(id: string) {
    const bus = buses.find(
      (item) => item.id === id
    );

    const busNumber =
      bus?.bus_number || "this bus";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${busNumber}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("buses")
      .delete()
      .eq("id", id);

    console.log("Delete Error:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Bus deleted successfully");

    fetchBuses();
  }

  // =====================================================
  // FILTER BUSES
  // =====================================================

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        bus.bus_number
          ?.toLowerCase()
          .includes(searchValue) ||
        bus.registration_number
          ?.toLowerCase()
          .includes(searchValue);

      const busStatus =
        bus.status?.toLowerCase() || "";

      const matchesStatus =
        statusFilter === "all" ||
        busStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [buses, search, statusFilter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalBuses = buses.length;

  const activeBuses = buses.filter(
    (bus) =>
      bus.status?.toLowerCase() === "active"
  ).length;

  const totalCapacity = buses.reduce(
    (total, bus) =>
      total + (bus.capacity || 0),
    0
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppLayout>

      <div className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="
          flex flex-col gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          <div>

            <h1 className="
              text-3xl
              font-bold
              text-slate-900
            ">
              Bus Fleet
            </h1>

            <p className="
              text-slate-500
              mt-1
            ">
              Manage buses, capacity and fleet status.
            </p>

          </div>

          <div className="
            flex items-center gap-3
          ">

            {/* Refresh */}

            <button
              onClick={fetchBuses}
              className="
                flex items-center gap-2
                px-4 py-3
                rounded-lg
                border border-slate-300
                bg-white
                text-slate-700
                hover:bg-slate-50
                transition
              "
            >
              <RefreshCw size={18} />

              Refresh
            </button>

            {/* Add Bus */}

            <button
              onClick={() =>
                navigate("/buses/add")
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
              <Plus size={18} />

              Add New Bus
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
        ">

          {/* TOTAL BUSES */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="
              flex items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Total Buses
                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  text-slate-900
                  mt-2
                ">
                  {totalBuses}
                </h2>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-blue-50
                text-blue-600
                flex items-center
                justify-center
              ">
                <Bus size={22} />
              </div>

            </div>

          </div>

          {/* ACTIVE BUSES */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="
              flex items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Active Buses
                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  text-slate-900
                  mt-2
                ">
                  {activeBuses}
                </h2>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-green-50
                text-green-600
                flex items-center
                justify-center
              ">
                <CheckCircle2 size={22} />
              </div>

            </div>

          </div>

          {/* CAPACITY */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="
              flex items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Total Capacity
                </p>

                <h2 className="
                  text-3xl
                  font-bold
                  text-slate-900
                  mt-2
                ">
                  {totalCapacity}
                </h2>

                <p className="
                  text-xs
                  text-slate-400
                  mt-1
                ">
                  seats
                </p>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-indigo-50
                text-indigo-600
                flex items-center
                justify-center
              ">
                <Users size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SEARCH + FILTER */}
        {/* ================================================= */}

        <div className="
          bg-white
          rounded-xl
          border border-slate-200
          shadow-sm
          p-4
        ">

          <div className="
            flex flex-col
            md:flex-row
            gap-3
          ">

            {/* SEARCH */}

            <div className="
              relative
              flex-1
            ">

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
                placeholder="
                  Search by bus number or registration...
                "
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

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
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
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

        {/* ================================================= */}
        {/* REGISTERED BUSES */}
        {/* ================================================= */}

        <div className="
          bg-white
          rounded-xl
          border border-slate-200
          shadow-sm
          overflow-hidden
        ">

          {/* TABLE HEADER */}

          <div className="
            px-6 py-5
            border-b border-slate-200
          ">

            <div className="
              flex items-center
              justify-between
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-slate-900
                ">
                  Registered Buses
                </h2>

                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                ">
                  Manage fleet information and status.
                </p>

              </div>

              <span className="
                text-sm
                text-slate-500
              ">
                {filteredBuses.length} bus
                {filteredBuses.length !== 1
                  ? "es"
                  : ""}
              </span>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="
              p-12
              text-center
            ">

              <RefreshCw
                size={24}
                className="
                  mx-auto
                  mb-3
                  animate-spin
                  text-blue-600
                "
              />

              <p className="
                text-slate-500
              ">
                Loading buses...
              </p>

            </div>

          ) : error ? (

            <div className="
              p-12
              text-center
            ">

              <AlertTriangle
                size={30}
                className="
                  mx-auto
                  mb-3
                  text-red-500
                "
              />

              <p className="
                font-medium
                text-red-600
              ">
                Failed to load buses
              </p>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {error}
              </p>

            </div>

          ) : filteredBuses.length === 0 ? (

            <div className="
              p-12
              text-center
            ">

              <Bus
                size={36}
                className="
                  mx-auto
                  mb-3
                  text-slate-300
                "
              />

              <p className="
                font-medium
                text-slate-700
              ">
                No buses found
              </p>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            <div className="
              overflow-x-auto
            ">

              <table className="
                w-full
                min-w-[850px]
              ">

                {/* TABLE HEAD */}

                <thead className="
                  bg-slate-50
                  border-b border-slate-200
                ">

                  <tr>

                    <th className="
                      text-left
                      px-6 py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Bus
                    </th>

                    <th className="
                      text-left
                      px-6 py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Registration
                    </th>

                    <th className="
                      text-left
                      px-6 py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Capacity
                    </th>

                    <th className="
                      text-left
                      px-6 py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Status
                    </th>

                    <th className="
                      text-left
                      px-6 py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Actions
                    </th>

                  </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody className="
                  divide-y
                  divide-slate-100
                ">

                  {filteredBuses.map(
                    (bus) => (

                      <tr
                        key={bus.id}
                        className="
                          hover:bg-slate-50
                          transition-colors
                        "
                      >

                        {/* BUS */}

                        <td className="
                          px-6 py-4
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              w-10 h-10
                              rounded-lg
                              bg-blue-50
                              text-blue-600
                              flex
                              items-center
                              justify-center
                              shrink-0
                            ">
                              <Bus size={19} />
                            </div>

                            <div>

                              <p className="
                                font-semibold
                                text-slate-900
                              ">
                                {bus.bus_number}
                              </p>

                              <p className="
                                text-xs
                                text-slate-500
                                mt-0.5
                              ">
                                Fleet ID:{" "}
                                {bus.id.slice(
                                  0,
                                  8
                                )}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* REGISTRATION */}

                        <td className="
                          px-6 py-4
                          text-sm
                          font-medium
                          text-slate-700
                        ">
                          {bus.registration_number}
                        </td>

                        {/* CAPACITY */}

                        <td className="
                          px-6 py-4
                        ">

                          <span className="
                            text-sm
                            text-slate-600
                          ">
                            {bus.capacity} seats
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="
                          px-6 py-4
                        ">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-3 py-1.5
                              rounded-full
                              text-xs
                              font-semibold
                              ${
                                bus.status?.toLowerCase() ===
                                "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }
                            `}
                          >

                            <span
                              className={`
                                w-1.5 h-1.5
                                rounded-full
                                ${
                                  bus.status?.toLowerCase() ===
                                  "active"
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }
                              `}
                            />

                            {bus.status ||
                              "Unknown"}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="
                          px-6 py-4
                        ">

                          <div className="
                            flex
                            items-center
                            gap-2
                          ">

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                navigate(
                                  `/buses/edit/${bus.id}`
                                )
                              }
                              title="Edit bus"
                              aria-label={`Edit ${bus.bus_number}`}
                              className="
                                w-10 h-10
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
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

                            {/* DELETE */}

                            <button
                              onClick={() =>
                                handleDeleteBus(
                                  bus.id
                                )
                              }
                              title="Delete bus"
                              aria-label={`Delete ${bus.bus_number}`}
                              className="
                                w-10 h-10
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
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