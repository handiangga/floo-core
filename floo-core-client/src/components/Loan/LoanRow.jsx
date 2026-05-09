import { Eye, Trash2 } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function LoanRow({ item, navigate, onDelete }) {
  const total = Number(item.total_amount) || 0;
  const remaining = Number(item.remaining_amount) || 0;
  const status = item.status;

  // ================= STATUS =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_manager":
        return "bg-amber-100 text-amber-700 border border-amber-200";

      case "pending_owner":
        return "bg-orange-100 text-orange-700 border border-orange-200";

      case "waiting_signature":
        return "bg-violet-100 text-violet-700 border border-violet-200";

      case "signed":
        return "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200";

      case "ongoing":
        return "bg-blue-100 text-blue-700 border border-blue-200";

      case "completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";

      case "rejected_manager":
        return "bg-red-100 text-red-700 border border-red-200";

      case "rejected_owner":
        return "bg-rose-100 text-rose-700 border border-rose-200";

      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending_manager":
        return "Pending Manager";

      case "pending_owner":
        return "Pending Owner";

      case "waiting_signature":
        return "Menunggu TTD";

      case "signed":
        return "Sudah TTD";

      case "ongoing":
        return "Aktif";

      case "completed":
        return "Lunas";

      case "rejected_manager":
        return "Ditolak Manager";

      case "rejected_owner":
        return "Ditolak Owner";

      default:
        return status;
    }
  };

  // ================= PROGRESS =================
  const progress = [
    "pending_manager",
    "pending_owner",
    "waiting_signature",
    "signed",
    "rejected_manager",
    "rejected_owner",
  ].includes(status)
    ? 0
    : total > 0
      ? Math.round(((total - remaining) / total) * 100)
      : 0;

  // ================= DELETE RULE =================
  const canDelete = [
    "pending_manager",
    "pending_owner",
    "rejected_manager",
    "rejected_owner",
  ].includes(status);

  // ================= EMP BADGE =================
  const getBadge = (pos) => {
    if (pos === "penjahit")
      return "bg-green-100 text-green-700 border border-green-200";

    if (pos === "staff")
      return "bg-blue-100 text-blue-700 border border-blue-200";

    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return (
    <tr className="border-t hover:bg-gray-50 transition">
      {/* NAMA */}
      <td className="p-4">
        <p className="font-medium text-gray-800">
          {item.Employee?.name || "-"}
        </p>

        <span
          className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${getBadge(
            item.Employee?.position,
          )}`}
        >
          {item.Employee?.position || "-"}
        </span>
      </td>

      {/* TOTAL */}
      <td className="p-4 font-medium text-gray-800">{formatRupiah(total)}</td>

      {/* SISA */}
      <td className="p-4 text-red-500 font-semibold">
        {status === "completed" ? "-" : formatRupiah(remaining)}
      </td>

      {/* PROGRESS */}
      <td className="p-4 w-[220px]">
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progress === 100
                ? "bg-emerald-500"
                : progress > 0
                  ? "bg-blue-500"
                  : "bg-gray-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs mt-2 text-gray-500 font-medium">{progress}%</p>
      </td>

      {/* STATUS */}
      <td className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusBadge(
            status,
          )}`}
        >
          {getStatusLabel(status)}
        </span>
      </td>

      {/* AKSI */}
      <td className="p-4">
        <div className="flex gap-2">
          {/* DETAIL */}
          <button
            onClick={() => navigate(`/loans/${item.id}`)}
            className="bg-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-200 transition"
          >
            <Eye size={16} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(item)}
            disabled={!canDelete}
            className={`p-2 rounded-xl transition ${
              canDelete
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
