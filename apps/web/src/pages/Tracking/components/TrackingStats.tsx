import {
  Activity,
  Gauge,
  MapPin,
  Navigation,
} from "lucide-react";

interface TrackingStatsProps {
  activeBuses: number;
  onRoute: number;
  averageSpeed: number;
  gpsAccuracy: number;
}

export default function TrackingStats({
  activeBuses,
  onRoute,
  averageSpeed,
  gpsAccuracy,
}: TrackingStatsProps) {
  const stats = [
    {
      label: "Active Buses",
      value: activeBuses,
      suffix: "",
      icon: Activity,
    },
    {
      label: "On Route",
      value: onRoute,
      suffix: "",
      icon: Navigation,
    },
    {
      label: "Average Speed",
      value: averageSpeed,
      suffix: " km/h",
      icon: Gauge,
    },
    {
      label: "GPS Accuracy",
      value: gpsAccuracy,
      suffix: " m",
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>

                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>

                  {stat.suffix && (
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Icon className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}