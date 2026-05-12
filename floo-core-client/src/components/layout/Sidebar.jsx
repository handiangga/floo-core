import { Link, useLocation } from "react-router-dom";

import { LayoutDashboard, Users, Wallet, PlusCircle } from "lucide-react";

import { getUser } from "../../utils/auth";

export default function Sidebar() {
  const location = useLocation();

  // =====================================================
  // 🔥 USER
  // =====================================================
  const user = getUser();

  const role = user?.role || "admin";

  // =====================================================
  // 🔥 DASHBOARD PATH
  // =====================================================
  const dashboardPath =
    role === "manager"
      ? "/dashboard/manager"
      : role === "owner"
        ? "/dashboard/owner"
        : "/dashboard";

  // =====================================================
  // 🔥 ROLE MENU
  // =====================================================
  let menus = [];

  // =====================================================
  // 🔥 ADMIN
  // =====================================================
  if (role === "admin") {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },

      {
        name: "Employees",
        path: "/employees",
        icon: Users,
      },

      {
        name: "Loans",
        path: "/loans",
        icon: Wallet,
      },

      {
        name: "Create Loan",
        path: "/loans/create",
        icon: PlusCircle,
      },
    ];
  }

  // =====================================================
  // 🔥 MANAGER
  // =====================================================
  if (role === "manager") {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard/manager",
        icon: LayoutDashboard,
      },

      {
        name: "Loan Approval",
        path: "/loans",
        icon: Wallet,
      },
    ];
  }

  // =====================================================
  // 🔥 OWNER
  // =====================================================
  if (role === "owner") {
    menus = [
      {
        name: "Dashboard",
        path: "/dashboard/owner",
        icon: LayoutDashboard,
      },
    ];
  }

  return (
    <div className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
      {/* =============================================== */}
      {/* 🔥 LOGO */}
      {/* =============================================== */}
      <h1 className="text-2xl font-bold text-blue-600 mb-10">Floo Core</h1>

      {/* =============================================== */}
      {/* 🔥 ROLE BADGE */}
      {/* =============================================== */}
      <div className="mb-6">
        <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 capitalize">
          {role}
        </div>
      </div>

      {/* =============================================== */}
      {/* 🔥 MENU */}
      {/* =============================================== */}
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

      {/* =============================================== */}
      {/* 🔥 FOOTER */}
      {/* =============================================== */}
      <div className="mt-auto text-xs text-gray-400">© 2026 Floo Core</div>
    </div>
  );
}
