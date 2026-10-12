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
} from "lucide-react";

const menu = [
  { icon: LayoutDashboard, title: "Dashboard" },
  { icon: Bus, title: "Buses" },
  { icon: UserCog, title: "Drivers" },
  { icon: Users, title: "Students" },
  { icon: Users, title: "Parents" },
  { icon: MapPinned, title: "Live Tracking" },
  { icon: QrCode, title: "QR Attendance" },
  { icon: Bell, title: "Notifications" },
  { icon: FileBarChart, title: "Reports" },
  { icon: Settings, title: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="w-72 h-screen bg-slate-900 text-white flex flex-col">

      <div className="text-2xl font-bold p-6 border-b border-slate-700">
        🚌 Smart Bus
      </div>

      <div className="flex-1">

        {menu.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800 cursor-pointer transition"
          >
            <item.icon size={22} />
            {item.title}
          </div>
        ))}

      </div>

      <div className="border-t border-slate-700 p-5 flex gap-3 items-center hover:bg-red-600 cursor-pointer">

        <LogOut />

        Logout

      </div>

    </div>
  );
}