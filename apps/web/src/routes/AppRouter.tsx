import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/Auth/Login";
import StudentDetails from "../pages/StudentManagement/StudentDetails";


import DriverDashboard from "../pages/Driver/Dashboard";
import AdminDashboard from "../pages/Admin/Dashboard";
import StudentDashboard from "../pages/Student/Dashboard";
import MyQRCode from "../pages/Student/MyQRCode";
import ParentDashboard from "../pages/Parent/Dashboard";
import SuperAdminDashboard from "../pages/SuperAdmin/Dashboard";
import LiveTracking from "../pages/Tracking/LiveTracking";

import AddBus from "../pages/BusManagement/AddBus";
import BusFleet from "../pages/Buses/BusFleet";
import EditBus from "../pages/BusManagement/EditBus";

import DriverList from "../pages/DriverManagement/DriverList";
import AddDriver from "../pages/DriverManagement/AddDriver";
import EditDriver from "../pages/DriverManagement/EditDriver";
import BusAttendanceQR from "../pages/Driver/BusAttendanceQR";
import Attendance from "../pages/Admin/Attendance";

import AddStudent from "../pages/StudentManagement/AddStudent";
import StudentList from "../pages/StudentManagement/StudentList";
import EditStudent from "../pages/StudentManagement/EditStudent";
import ScanBusQR from "../pages/Student/ScanBusQR";

import AddParent from "../pages/Parent/AddParent";
import EditParent from "../pages/Parent/EditParent";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/driver"
          element={<DriverDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/attendance"
          element={<Attendance />}
        />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/qr"
          element={<MyQRCode />}
        />

        <Route
          path="/parents"
          element={<ParentDashboard />}
        />

        <Route
          path="/tracking"
          element={<LiveTracking />}
        />

        <Route
          path="/live-tracking"
          element={<LiveTracking />}
        />

        <Route
          path="/super-admin"
          element={<SuperAdminDashboard />}
        />

        {/* Bus Fleet */}
        <Route
          path="/buses"
          element={<BusFleet />}
        />

        {/* Add Bus */}
        <Route
          path="/buses/add"
          element={<AddBus />}
        />
        <Route
          path="/buses/edit/:id"
           element={<EditBus />}
        />
        <Route
          path="/drivers"
          element={<DriverList />}
        />
        <Route
          path="/drivers/add"
          element={<AddDriver />}
        />
        <Route
          path="/drivers/edit/:id"
          element={<EditDriver />}
        />

        <Route
          path="/driver/attendance-qr"
          element={<BusAttendanceQR />}
        />

        <Route
          path="/students"
          element={<StudentList />}
        />

        <Route
          path="/students/add"
          element={<AddStudent />}
        />
        <Route
          path="/students/edit/:id"
          element={<EditStudent />}
        />
        <Route
          path="/students/view/:id"
          element={<StudentDetails />}
        />

        <Route
          path="/student/scan-bus-qr"
          element={<ScanBusQR />}
        />



        <Route
          path="/parents/add"
          element={<AddParent />}
        />

        <Route
          path="/parents/edit/:id"
          element={<EditParent />}
        />


      </Routes>
    </BrowserRouter>
  );
}
