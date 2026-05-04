import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { getUser } from "../../utils/auth"; // 🔥 ambil user

export default function Topbar() {
  const location = useLocation();
  const user = getUser(); // 🔥 ambil data user

  const getTitle = () => {
    if (location.pathname.includes("employees")) return "Employees";
    if (location.pathname.includes("loans")) return "Loans";
    return "Dashboard";
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin logout?",
      text: "Session kamu akan berakhir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Logging out...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    localStorage.removeItem("access_token");
    sessionStorage.clear();

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  // 🔥 format nama & role
  const displayName = user?.name || "User";
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  return (
    <div className="h-16 bg-white/80 backdrop-blur border-b px-6 flex items-center justify-between shadow-sm">
      {/* TITLE */}
      <h1 className="text-lg font-semibold text-gray-800">{getTitle()}</h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* 🔥 DINAMIS */}
        <div className="text-sm text-gray-500 hidden sm:block">
          Hi, {displayName}
          {displayRole && (
            <span className="ml-2 text-xs text-gray-400">({displayRole})</span>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
