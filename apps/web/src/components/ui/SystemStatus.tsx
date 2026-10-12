import {
  Database,
  ShieldCheck,
  MapPinned,
  Bell,
} from "lucide-react";

const services = [
  {
    icon: Database,
    title: "Database",
    status: "Connected",
  },
  {
    icon: ShieldCheck,
    title: "Authentication",
    status: "Online",
  },
  {
    icon: MapPinned,
    title: "GPS Tracking",
    status: "Ready",
  },
  {
    icon: Bell,
    title: "Notifications",
    status: "Active",
  },
];

export default function SystemStatus() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-bold mb-6">
        System Status
      </h2>

      <div className="space-y-5">

        {services.map((service) => (
          <div
            key={service.title}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-3">

              <service.icon
                className="text-blue-600"
                size={20}
              />

              <span>{service.title}</span>

            </div>

            <span className="text-green-600 font-semibold">
              ● {service.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}