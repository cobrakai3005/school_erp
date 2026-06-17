import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AppProvider } from "./context";
import { Layout } from "./components/layout";
import {
  Login,
  Dashboard,
  Students,
  Teachers,
  Classes,
  Schools,
  Attendance,
  Fees,
  Exams,
  Library,
  Homework,
  Salary,
  SuperAdminStudents,
  SuperAdminTeachers,
  SuperAdminStaff,
  SuperAdminAdmins,
  SuperAdminClasses,
} from "./pages";
import Notifications from "./pages/Notifications";
import Staff from "./pages/Staff";
import Accontants from "./pages/Accontants";
import Timetables from "./pages/Timetables";
import Parents from "./pages/Parents";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="schools" element={<Schools />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="exams" element={<Exams />} />
              <Route path="library" element={<Library />} />
              <Route path="homework" element={<Homework />} />
              <Route path="accountants" element={<Accontants />} />
              <Route path="staff" element={<Staff />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="timetables" element={<Timetables />} />
              <Route path="parents" element={<Parents />} />
              <Route path="salary" element={<Salary />} />
              {/* Super Admin Routes */}
              <Route
                path="super-admin/students"
                element={<SuperAdminStudents />}
              />
              <Route
                path="super-admin/teachers"
                element={<SuperAdminTeachers />}
              />
              <Route path="super-admin/staff" element={<SuperAdminStaff />} />
              <Route path="super-admin/admins" element={<SuperAdminAdmins />} />
              <Route
                path="super-admin/classes"
                element={<SuperAdminClasses />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
