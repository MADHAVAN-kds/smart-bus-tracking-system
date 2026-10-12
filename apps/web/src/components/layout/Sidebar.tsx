import {
  LayoutDashboard,
  Bus,
  Users,
  UserCog,
  MapPinned,
  QrCode,
  Bell,
  FileBarChart,
  Settings,
  LogOut,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const managementItems = [
  {
    icon: Bus,
    title: "Buses",
    path: "/buses",
  },
  {
    icon: UserCog,
    title: "Drivers",
    path: "/drivers",
  },
  {
    icon: GraduationCap,
    title: "Students",
    path: "/students",
  },
  {
    icon: Users,
    title: "Parents",
    path: "/parents",
  },
];

const operationItems = [
  {
    icon: MapPinned,
    title: "Live Tracking",
    path: "/live-tracking",
  },
  {
    icon: QrCode,
    title: "Attendance",
    path: "/attendance",
  },
  {
    icon: Bell,
    title: "Notifications",
    path: "/notifications",
  },
];

const reportItems = [
  {
    icon: FileBarChart,
    title: "Reports",
    path: "/reports",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [managementOpen, setManagementOpen] =
    useState(true);

  const [operationsOpen, setOperationsOpen] =
    useState(true);

  function isActive(path: string) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  }

  const managementActive = managementItems.some(
    (item) => isActive(item.path)
  );

  const operationsActive = operationItems.some(
    (item) => isActive(item.path)
  );

  return (
    <aside className="w-64 shrink-0 bg-slate-950 text-white min-h-screen flex flex-col border-r border-slate-800">

      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <div className="h-20 px-5 flex items-center border-b border-slate-800">

        <button
          onClick={() => navigate("/super-admin")}
          className="flex items-center gap-3 w-full"
        >

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Bus size={22} />
          </div>

          <div className="text-left">

            <h1 className="text-lg font-bold tracking-tight">
              SmartBus
            </h1>

            <p className="text-[11px] text-slate-400">
              Transport Management
            </p>

          </div>

        </button>

      </div>

      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">

        {/* Dashboard */}

        <button
          onClick={() =>
            navigate("/super-admin")
          }
          className={`
            w-full flex items-center gap-3
            px-3 py-2.5 mb-2
            rounded-lg
            text-sm font-medium
            transition-all duration-200
            ${
              isActive("/super-admin")
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }
          `}
        >

          <LayoutDashboard size={19} />

          <span>Dashboard</span>

        </button>

        {/* ================================================= */}
        {/* MANAGEMENT */}
        {/* ================================================= */}

        <div className="mt-5">

          <button
            onClick={() =>
              setManagementOpen(
                !managementOpen
              )
            }
            className={`
              w-full flex items-center justify-between
              px-3 py-2
              text-xs font-semibold uppercase
              tracking-wider
              ${
                managementActive
                  ? "text-blue-400"
                  : "text-slate-500"
              }
            `}
          >

            <span>Management</span>

            {managementOpen ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )}

          </button>

          {managementOpen && (

            <div className="mt-2 space-y-1">

              {managementItems.map(
                (item) => {

                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() =>
                        navigate(item.path)
                      }
                      className={`
                        w-full flex items-center gap-3
                        px-3 py-2.5
                        rounded-lg
                        text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive(item.path)
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }
                      `}
                    >

                      <Icon size={19} />

                      <span>
                        {item.title}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* OPERATIONS */}
        {/* ================================================= */}

        <div className="mt-6">

          <button
            onClick={() =>
              setOperationsOpen(
                !operationsOpen
              )
            }
            className={`
              w-full flex items-center justify-between
              px-3 py-2
              text-xs font-semibold uppercase
              tracking-wider
              ${
                operationsActive
                  ? "text-blue-400"
                  : "text-slate-500"
              }
            `}
          >

            <span>Operations</span>

            {operationsOpen ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )}

          </button>

          {operationsOpen && (

            <div className="mt-2 space-y-1">

              {operationItems.map(
                (item) => {

                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() =>
                        navigate(item.path)
                      }
                      className={`
                        w-full flex items-center gap-3
                        px-3 py-2.5
                        rounded-lg
                        text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive(item.path)
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }
                      `}
                    >

                      <Icon size={19} />

                      <span>
                        {item.title}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* REPORTS */}
        {/* ================================================= */}

        <div className="mt-6">

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Analytics
          </p>

          <div className="mt-1 space-y-1">

            {reportItems.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  onClick={() =>
                    navigate(item.path)
                  }
                  className={`
                    w-full flex items-center gap-3
                    px-3 py-2.5
                    rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive(item.path)
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >

                  <Icon size={19} />

                  <span>{item.title}</span>

                </button>
              );

            })}

          </div>

        </div>

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        <div className="mt-6">

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            System
          </p>

          <button
            onClick={() =>
              navigate("/settings")
            }
            className={`
              w-full flex items-center gap-3
              px-3 py-2.5
              rounded-lg
              text-sm font-medium
              transition-all duration-200
              ${
                isActive("/settings")
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }
            `}
          >

            <Settings size={19} />

            <span>Settings</span>

          </button>

        </div>

      </nav>

      {/* ================================================= */}
      {/* ADMIN PROFILE */}
      {/* ================================================= */}

      <div className="border-t border-slate-800 p-3">

        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-slate-900">

          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">

            <ShieldCheck size={18} />

          </div>

          <div className="flex-1 min-w-0">

            <p className="text-sm font-semibold truncate">
              Super Admin
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>

          </div>

        </div>

        {/* Logout */}

        <button
          onClick={() =>
            navigate("/login")
          }
          className="
            w-full flex items-center gap-3
            px-3 py-2.5
            rounded-lg
            text-sm font-medium
            text-slate-400
            hover:bg-red-500/10
            hover:text-red-400
            transition
          "
        >

          <LogOut size={19} />

          <span>Sign out</span>

        </button>

      </div>

    </aside>
  );
}