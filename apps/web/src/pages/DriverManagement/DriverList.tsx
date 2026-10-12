import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Bus,
} from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import { supabase } from "../../lib/supabase";

type Driver = {
  id: string;
  name: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
  experience: number | null;
  bus_id: string | null;
  assigned_bus: string | null;
  status: string | null;
};

type BusData = {
  id: string;
  bus_number: string;
};

export default function DriverList() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<BusData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // FETCH DRIVERS
  // =====================================================

  async function fetchDrivers() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("drivers")
      .select(
        "id, name, phone, license_number, license_expiry, experience, bus_id, assigned_bus, status"
      )
      .order("created_at", { ascending: false });

    console.log("Drivers:", data);
    console.log("Drivers Error:", error);

    if (error) {
      setError(error.message);
      setDrivers([]);
    } else {
      setDrivers(data || []);
    }

    setLoading(false);
  }

  // =====================================================
  // FETCH BUSES
  // =====================================================

  async function fetchBuses() {
    const { data, error } = await supabase
      .from("buses")
      .select("id, bus_number")
      .order("bus_number", { ascending: true });

    console.log("Driver Buses:", data);
    console.log("Bus Error:", error);

    if (!error) {
      setBuses(data || []);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDrivers();
    fetchBuses();
  }, []);

  // =====================================================
  // DELETE DRIVER
  // =====================================================

  async function deleteDriver(id: string) {
    const driver = drivers.find(
      (item) => item.id === id
    );

    const driverName = driver?.name || "this driver";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${driverName}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Driver deleted successfully");

    fetchDrivers();
  }

  // =====================================================
  // FIND BUS NUMBER
  // =====================================================

  function getBusNumber(busId: string | null) {
    if (!busId) return null;

    const bus = buses.find(
      (item) => item.id === busId
    );

    return bus?.bus_number || null;
  }

  // =====================================================
  // LICENSE EXPIRY
  // =====================================================

  function getLicenseStatus(
    expiry: string | null
  ) {
    if (!expiry) {
      return {
        label: "Not provided",
        type: "unknown",
      };
    }

    const expiryDate = new Date(expiry);

    if (Number.isNaN(expiryDate.getTime())) {
      return {
        label: "Invalid date",
        type: "unknown",
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const difference =
      expiryDate.getTime() - today.getTime();

    const daysRemaining =
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );

    if (daysRemaining < 0) {
      return {
        label: "Expired",
        type: "expired",
      };
    }

    if (daysRemaining <= 30) {
      return {
        label: `${daysRemaining} days left`,
        type: "warning",
      };
    }

    return {
      label: "Valid",
      type: "valid",
    };
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date: string | null) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // FILTER DRIVERS
  // =====================================================

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        driver.name
          ?.toLowerCase()
          .includes(searchValue) ||
        driver.phone
          ?.toLowerCase()
          .includes(searchValue) ||
        driver.license_number
          ?.toLowerCase()
          .includes(searchValue);

      const driverStatus =
        driver.status?.toLowerCase() || "";

      const matchesStatus =
        statusFilter === "all" ||
        driverStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [drivers, search, statusFilter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalDrivers = drivers.length;

  const activeDrivers = drivers.filter(
    (driver) =>
      driver.status?.toLowerCase() ===
      "active"
  ).length;

  const assignedDrivers = drivers.filter(
    (driver) => driver.bus_id !== null
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppLayout>

      <div className="space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Drivers
            </h1>

            <p className="text-slate-500 mt-1">
              Manage drivers, licenses and bus assignments.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => {
                fetchDrivers();
                fetchBuses();
              }}
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

            <button
              onClick={() =>
                navigate("/drivers/add")
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

              Add Driver

            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Total */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Drivers
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {totalDrivers}
                </h2>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-blue-50
                text-blue-600
                flex items-center justify-center
              ">
                <User size={22} />
              </div>

            </div>

          </div>

          {/* Active */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Active Drivers
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {activeDrivers}
                </h2>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-green-50
                text-green-600
                flex items-center justify-center
              ">
                <CheckCircle2 size={22} />
              </div>

            </div>

          </div>

          {/* Assigned */}

          <div className="
            bg-white
            rounded-xl
            border border-slate-200
            shadow-sm
            p-5
          ">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Assigned to Bus
                </p>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {assignedDrivers}
                </h2>

              </div>

              <div className="
                w-11 h-11
                rounded-lg
                bg-indigo-50
                text-indigo-600
                flex items-center justify-center
              ">
                <Bus size={22} />
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

          <div className="flex flex-col md:flex-row gap-3">

            {/* Search */}

            <div className="relative flex-1">

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
                placeholder="Search by driver, phone or license..."
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

            {/* Status */}

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
        {/* TABLE */}
        {/* ================================================= */}

        <div className="
          bg-white
          rounded-xl
          border border-slate-200
          shadow-sm
          overflow-hidden
        ">

          <div className="
            px-6 py-5
            border-b border-slate-200
          ">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Registered Drivers
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage driver information and assignments.
                </p>

              </div>

              <span className="
                text-sm
                text-slate-500
              ">
                {filteredDrivers.length} driver
                {filteredDrivers.length !== 1
                  ? "s"
                  : ""}
              </span>

            </div>

          </div>

          {/* Loading */}

          {loading ? (

            <div className="p-12 text-center">

              <RefreshCw
                size={24}
                className="
                  mx-auto
                  mb-3
                  animate-spin
                  text-blue-600
                "
              />

              <p className="text-slate-500">
                Loading drivers...
              </p>

            </div>

          ) : error ? (

            <div className="p-12 text-center">

              <AlertTriangle
                size={30}
                className="
                  mx-auto
                  mb-3
                  text-red-500
                "
              />

              <p className="font-medium text-red-600">
                Failed to load drivers
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {error}
              </p>

            </div>

          ) : filteredDrivers.length === 0 ? (

            <div className="p-12 text-center">

              <User
                size={36}
                className="
                  mx-auto
                  mb-3
                  text-slate-300
                "
              />

              <p className="font-medium text-slate-700">
                No drivers found
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search or filter.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                {/* HEADER */}

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
                      Driver
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
                      Phone
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
                      License
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
                      Experience
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
                      Assigned Bus
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
                      License Expiry
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

                {/* BODY */}

                <tbody className="divide-y divide-slate-100">

                  {filteredDrivers.map(
                    (driver) => {

                      const busNumber =
                        getBusNumber(
                          driver.bus_id
                        );

                      const licenseStatus =
                        getLicenseStatus(
                          driver.license_expiry
                        );

                      return (

                        <tr
                          key={driver.id}
                          className="
                            hover:bg-slate-50
                            transition-colors
                          "
                        >

                          {/* DRIVER */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="
                                w-10 h-10
                                rounded-full
                                bg-blue-50
                                text-blue-600
                                flex items-center justify-center
                                shrink-0
                              ">
                                <User size={19} />
                              </div>

                              <div>

                                <p className="
                                  font-semibold
                                  text-slate-900
                                ">
                                  {driver.name ||
                                    "Unnamed Driver"}
                                </p>

                                <p className="
                                  text-xs
                                  text-slate-500
                                  mt-0.5
                                ">
                                  Driver ID:{" "}
                                  {driver.id.slice(
                                    0,
                                    8
                                  )}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* PHONE */}

                          <td className="
                            px-6 py-4
                            text-sm
                            text-slate-600
                          ">
                            {driver.phone || "-"}
                          </td>

                          {/* LICENSE */}

                          <td className="
                            px-6 py-4
                            text-sm
                            font-medium
                            text-slate-700
                          ">
                            {driver.license_number ||
                              "-"}
                          </td>

                          {/* EXPERIENCE */}

                          <td className="
                            px-6 py-4
                            text-sm
                            text-slate-600
                          ">
                            {driver.experience ?? 0}{" "}
                            year
                            {driver.experience === 1
                              ? ""
                              : "s"}
                          </td>

                          {/* BUS */}

                          <td className="px-6 py-4">

                            {busNumber ? (

                              <span className="
                                inline-flex
                                items-center
                                gap-2
                                px-3 py-1.5
                                rounded-full
                                bg-emerald-50
                                text-emerald-700
                                text-sm
                                font-medium
                              ">

                                <Bus size={15} />

                                {busNumber}

                              </span>

                            ) : (

                              <span className="
                                text-sm
                                text-slate-400
                              ">
                                Not Assigned
                              </span>

                            )}

                          </td>

                          {/* EXPIRY */}

                          <td className="px-6 py-4">

                            <div className="space-y-1">

                              <p className="
                                text-sm
                                text-slate-700
                              ">
                                {formatDate(
                                  driver.license_expiry
                                )}
                              </p>

                              {licenseStatus.type ===
                                "expired" && (

                                <span className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  text-xs
                                  font-medium
                                  text-red-600
                                ">
                                  <AlertTriangle
                                    size={13}
                                  />
                                  Expired
                                </span>

                              )}

                              {licenseStatus.type ===
                                "warning" && (

                                <span className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  text-xs
                                  font-medium
                                  text-amber-600
                                ">
                                  <AlertTriangle
                                    size={13}
                                  />
                                  {
                                    licenseStatus.label
                                  }
                                </span>

                              )}

                              {licenseStatus.type ===
                                "valid" && (

                                <span className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  text-xs
                                  font-medium
                                  text-emerald-600
                                ">
                                  <CheckCircle2
                                    size={13}
                                  />
                                  Valid
                                </span>

                              )}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">

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
                                  driver.status?.toLowerCase() ===
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
                                    driver.status?.toLowerCase() ===
                                    "active"
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }
                                `}
                              />

                              {driver.status ||
                                "Unknown"}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-2">

                              {/* EDIT */}

                              <button
                                onClick={() =>
                                  navigate(
                                    `/drivers/edit/${driver.id}`
                                  )
                                }
                                title="Edit driver"
                                aria-label={`Edit ${
                                  driver.name ||
                                  "driver"
                                }`}
                                className="
                                  w-10 h-10
                                  flex items-center justify-center
                                  rounded-lg
                                  border border-slate-200
                                  bg-white
                                  text-slate-500
                                  hover:bg-blue-50
                                  hover:text-blue-600
                                  hover:border-blue-200
                                  transition-all duration-200
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
                                  deleteDriver(
                                    driver.id
                                  )
                                }
                                title="Delete driver"
                                aria-label={`Delete ${
                                  driver.name ||
                                  "driver"
                                }`}
                                className="
                                  w-10 h-10
                                  flex items-center justify-center
                                  rounded-lg
                                  border border-slate-200
                                  bg-white
                                  text-slate-500
                                  hover:bg-red-50
                                  hover:text-red-600
                                  hover:border-red-200
                                  transition-all duration-200
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

                      );
                    }
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