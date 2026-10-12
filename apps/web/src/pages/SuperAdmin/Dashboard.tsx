import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import ActivityCard from "../../components/ui/ActivityCard";
import SystemStatus from "../../components/ui/SystemStatus";

import {
  Bus,
  Users,
  UserCog,
  MapPinned,
} from "lucide-react";

export default function SuperAdminDashboard() {
  return (
    <AppLayout>
      <div>

        <h1 className="text-3xl font-bold mb-8">
          Dashboard Overview
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatCard
            title="Total Buses"
            value="15"
            subtitle="+2 Today"
            icon={<Bus className="text-blue-600" />}
          />

          <StatCard
            title="Students"
            value="420"
            subtitle="+8 Today"
            icon={<Users className="text-green-600" />}
          />

          <StatCard
            title="Drivers"
            value="20"
            subtitle="+1 Today"
            icon={<UserCog className="text-orange-600" />}
          />

          <StatCard
            title="Active Trips"
            value="12"
            subtitle="Live"
            icon={<MapPinned className="text-red-600" />}
          />

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-bold mb-6">
              Recent Activity
            </h2>

            <ActivityCard
              title="Driver Arun checked in"
              time="2 min ago"
            />

            <ActivityCard
              title="Bus TN-22-AB-1234 started trip"
              time="5 min ago"
            />

            <ActivityCard
              title="Student Ravi scanned QR"
              time="10 min ago"
            />

            <ActivityCard
              title="New parent registered"
              time="30 min ago"
            />

          </div>

          {/* System Status */}
          <SystemStatus />

        </div>

      </div>
    </AppLayout>
  );
}