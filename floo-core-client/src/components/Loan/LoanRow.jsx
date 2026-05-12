import { Eye, Trash2 } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function LoanRow({ item, navigate, onDelete }) {
  const total = Number(item.total_amount) || 0;

  const remaining = Number(item.remaining_amount) || 0;

  const status = item.status;

  // =====================================
  // STATUS BADGE
  // =====================================
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_manager":
        return `
          bg-gradient-to-r
          from-amber-50
          to-yellow-50
          text-amber-700
          border
          border-amber-200
        `;

      case "pending_owner":
        return `
          bg-gradient-to-r
          from-orange-50
          to-amber-50
          text-orange-700
          border
          border-orange-200
        `;

      case "waiting_signature":
        return `
          bg-gradient-to-r
          from-violet-50
          to-fuchsia-50
          text-violet-700
          border
          border-violet-200
        `;

      case "signed":
        return `
          bg-gradient-to-r
          from-fuchsia-50
          to-pink-50
          text-fuchsia-700
          border
          border-fuchsia-200
        `;

      case "ongoing":
        return `
          bg-gradient-to-r
          from-blue-50
          to-indigo-50
          text-blue-700
          border
          border-blue-200
        `;

      case "paid":
        return `
          bg-gradient-to-r
          from-emerald-50
          to-green-50
          text-emerald-700
          border
          border-emerald-200
        `;

      case "overdue":
        return `
          bg-gradient-to-r
          from-red-50
          to-rose-50
          text-red-700
          border
          border-red-200
        `;

      case "rejected_manager":
      case "rejected_owner":
        return `
          bg-gradient-to-r
          from-rose-50
          to-red-50
          text-rose-700
          border
          border-rose-200
        `;

      default:
        return `
          bg-gray-100
          text-gray-600
          border
          border-gray-200
        `;
    }
  };

  // =====================================
  // STATUS LABEL
  // =====================================
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

      case "paid":
        return "Lunas";

      case "overdue":
        return "Terlambat";

      case "rejected_manager":
        return "Ditolak Manager";

      case "rejected_owner":
        return "Ditolak Owner";

      default:
        return status;
    }
  };

  // =====================================
  // STATUS ICON
  // =====================================
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_manager":
        return "⏳";

      case "pending_owner":
        return "📝";

      case "waiting_signature":
        return "📄";

      case "signed":
        return "✍️";

      case "ongoing":
        return "💰";

      case "paid":
        return "✅";

      case "overdue":
        return "⚠️";

      case "rejected_manager":
      case "rejected_owner":
        return "❌";

      default:
        return "•";
    }
  };

  // =====================================
  // PROGRESS
  // =====================================
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

  // =====================================
  // DELETE RULE
  // =====================================
  const canDelete = [
    "pending_manager",
    "pending_owner",
    "rejected_manager",
    "rejected_owner",
  ].includes(status);

  // =====================================
  // POSITION BADGE
  // =====================================
  const getBadge = (pos) => {
    if (pos === "penjahit")
      return `
        bg-green-50
        text-green-700
        border
        border-green-200
      `;

    if (pos === "staff")
      return `
        bg-blue-50
        text-blue-700
        border
        border-blue-200
      `;

    return `
      bg-gray-100
      text-gray-600
      border
      border-gray-200
    `;
  };

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/70 transition-all duration-300">
      {/* =====================================
          EMPLOYEE
      ===================================== */}
      <td className="p-5">
        <div className="space-y-2">
          <p className="font-semibold text-gray-800 text-[17px]">
            {item.Employee?.name || "-"}
          </p>

          <span
            className={`
              inline-flex
              items-center
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              ${getBadge(item.Employee?.position)}
            `}
          >
            {item.Employee?.position || "-"}
          </span>
        </div>
      </td>

      {/* =====================================
          TOTAL
      ===================================== */}
      <td className="p-5">
        <p className="font-semibold text-gray-800 text-[16px]">
          {formatRupiah(total)}
        </p>
      </td>

      {/* =====================================
          REMAINING
      ===================================== */}
      <td className="p-5">
        <p
          className={`
            font-bold
            text-[16px]
            ${status === "paid" ? "text-emerald-500" : "text-red-500"}
          `}
        >
          {status === "paid" ? "Rp 0" : formatRupiah(remaining)}
        </p>
      </td>

      {/* =====================================
          PROGRESS
      ===================================== */}
      <td className="p-5 min-w-[300px]">
        {/* BAR */}
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
          <div
            className={`
              h-3
              rounded-full
              transition-all
              duration-700
              ${
                progress === 100
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : progress > 0
                    ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                    : "bg-gray-300"
              }
            `}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* INFO */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 font-semibold">{progress}%</p>

          {status === "paid" && (
            <span className="text-[11px] font-bold tracking-wide text-emerald-600">
              LUNAS
            </span>
          )}
        </div>
      </td>

      {/* =====================================
          STATUS
      ===================================== */}
      <td className="p-5">
        <span
          className={`
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            text-xs
            font-bold
            shadow-sm
            ${getStatusBadge(status)}
          `}
        >
          <span>{getStatusIcon(status)}</span>

          <span>{getStatusLabel(status)}</span>
        </span>
      </td>

      {/* =====================================
          ACTIONS
      ===================================== */}
      <td className="p-5">
        <div className="flex items-center gap-3">
          {/* DETAIL */}
          <button
            onClick={() => navigate(`/loans/${item.id}`)}
            className="
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              bg-gradient-to-r
              from-blue-50
              to-indigo-50
              text-blue-600
              border
              border-blue-100
              hover:scale-105
              hover:shadow-md
              transition-all
            "
          >
            <Eye size={18} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(item)}
            disabled={!canDelete}
            className={`
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              transition-all
              ${
                canDelete
                  ? `
                    bg-gradient-to-r
                    from-red-50
                    to-rose-50
                    text-red-600
                    border
                    border-red-100
                    hover:scale-105
                    hover:shadow-md
                  `
                  : `
                    bg-gray-100
                    text-gray-400
                    cursor-not-allowed
                  `
              }
            `}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
