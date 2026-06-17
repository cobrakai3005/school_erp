import { NavLink } from "react-router-dom";
import { useAuth } from "../../context";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Library,
  FileText,
  ClipboardList,
  Building2,
  Settings,
  X,
  Shield,
  UserCog,
  Layers,
  AlertCircle,
  Package,
  GroupIcon,
} from "lucide-react";

const menuItems = {
  super_admin: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/schools", icon: Building2, label: "Schools" },
    { type: "divider", label: "All Schools Data" },
    { path: "/super-admin/students", icon: Users, label: "All Students" },
    {
      path: "/super-admin/teachers",
      icon: GraduationCap,
      label: "All Teachers",
    },
    { path: "/super-admin/staff", icon: UserCog, label: "All Staff" },
    { path: "/super-admin/admins", icon: Shield, label: "All Admins" },
    { path: "/super-admin/classes", icon: Layers, label: "All Classes" },
    { type: "divider", label: "Settings" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ],
  admin: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { type: "divider", label: "People" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/teachers", icon: GraduationCap, label: "Teachers" },
    { path: "/accountants", icon: GraduationCap, label: "Accountants" },
    { path: "/classes", icon: BookOpen, label: "Classes" },
    { path: "/staff", icon: Package, label: "Staff" },
    { path: "/parents", icon: GroupIcon, label: "Parents" },
    { type: "divider", label: "Academics" },
    // { path: "/attendance", icon: Calendar, label: "Attendance" },
    // { path: "/homework", icon: ClipboardList, label: "Homework" },
    { path: "/timetables", icon: FileText, label: "Timetables" },
    { path: "/exams", icon: FileText, label: "Exams" },
    { path: "/library", icon: Library, label: "Library" },
    { type: "divider", label: "Finance" },
    { path: "/fees", icon: DollarSign, label: "Fees" },
    { path: "/salary", icon: DollarSign, label: "Salary" },
    { path: "/notifications", icon: AlertCircle, label: "Notifications" },
  ],
  teacher: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/classes", icon: BookOpen, label: "My Classes" },
    { path: "/attendance", icon: Calendar, label: "Attendance" },
    { path: "/homework", icon: ClipboardList, label: "Homework" },
    // { path: '/exams', icon: FileText, label: 'Exams' },
    // { path: '/library', icon: Library, label: 'Library' },
  ],
  student: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/attendance", icon: Calendar, label: "My Attendance" },
    { path: "/homework", icon: ClipboardList, label: "Homework" },
    { path: "/exams", icon: FileText, label: "Results" },
    // { path: '/library', icon: Library, label: 'Library' },
    { path: '/fees', icon: DollarSign, label: 'My Fees' },
  ],
  accountant_fee: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/fees", icon: DollarSign, label: "Fee Management" },
    { path: "/students", icon: Users, label: "Students" },
  ],
  accountant_salary: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/salary", icon: DollarSign, label: "Salary Management" },
    { path: "/teachers", icon: GraduationCap, label: "Staff" },
  ],
  librarian: [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/library", icon: Library, label: "Library" },
    { path: "/students", icon: Users, label: "Students" },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, school, isSuperAdmin, userType } = useAuth();

  const role = isSuperAdmin ? "super_admin" : userType;
  const items = menuItems[role] || menuItems.admin;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-100 border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-50/30">
          <div>
            <h1 className="font-semibold text-slate-50">School ERP</h1>
            {school && (
              <p className="text-xs text-slate-200 truncate">
                {school.school_name}
              </p>
            )}
            {isSuperAdmin && (
              <p className="text-xs text-blue-600 font-medium">Super Admin</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {items.map((item, index) => {
            if (item.type === "divider") {
              return (
                <div key={index} className="pt-4 pb-2">
                  <p className="px-3 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-300 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-white border-slate-200 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-50">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {isSuperAdmin ? "Super Admin" : userType?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
