import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Wallet } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Employees", path: "/employees", icon: Users },
    { name: "Loans", path: "/loans", icon: Wallet },
  ];

  return (
    <div className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
      {/* LOGO */}
      <h1 className="text-2xl font-bold text-blue-600 mb-10">Floo Core</h1>

      {/* MENU */}
      <div className="flex flex-col gap-2">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-auto text-xs text-gray-400">© 2026 Floo Core</div>
    </div>
  );
}
