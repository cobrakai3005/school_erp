import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import { Menu, LogOut, User } from "lucide-react";
import Sidebar from "./Sidebar";
import Notifications from "../Notifications";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin, userType } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="h-16 bg-white border-b text-zinc-800 border-slate-200 flex items-center justify-between px-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 lg:ml-0" />

        <div className="flex items-center gap-2">
          <Notifications />

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    <p className="text-xs text-slate-500 capitalize mt-1">
                      {isSuperAdmin
                        ? "Super Admin"
                        : userType?.replace("_", " ")}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
