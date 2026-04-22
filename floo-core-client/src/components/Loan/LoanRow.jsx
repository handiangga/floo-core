import { Eye, Trash2 } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function LoanRow({ item, navigate, onDelete }) {
  const total = Number(item.total_amount) || 0;
  const remaining = Number(item.remaining_amount) || 0;

  const progress =
    total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;

  const isLunas = remaining === 0;
  const canDelete = remaining === total || isLunas;

  const getBadge = (pos) => {
    if (pos === "penjahit") return "bg-green-100 text-green-600";
    if (pos === "staff") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <tr className="border-t hover:bg-gray-50 transition">
      {/* NAMA */}
      <td className="p-4">
        <p className="font-medium">{item.Employee?.name || "-"}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${getBadge(item.Employee?.position)}`}
        >
          {item.Employee?.position || "-"}
        </span>
      </td>

      {/* TOTAL */}
      <td className="p-4">{formatRupiah(total)}</td>

      {/* SISA */}
      <td className="p-4 text-red-500 font-medium">
        {remaining === 0 ? "-" : formatRupiah(remaining)}
      </td>

      {/* PROGRESS */}
      <td className="p-4 w-[200px]">
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className={`h-2 rounded-full ${
              progress === 100
                ? "bg-green-500"
                : progress > 0
                  ? "bg-blue-500"
                  : "bg-gray-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs mt-1 text-gray-500">{progress}%</p>
      </td>

      {/* STATUS */}
      <td className="p-4">
        <span
          className={`px-3 py-1 text-xs rounded-full ${
            isLunas
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {isLunas ? "Lunas" : "Aktif"}
        </span>
      </td>

      {/* AKSI */}
      <td className="p-4">
        <div className="flex gap-2">
          {/* DETAIL */}
          <button
            onClick={() => navigate(`/loans/${item.id}`)}
            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
          >
            <Eye size={16} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(item)} // 🔥 FIX DI SINI
            disabled={!canDelete}
            className={`p-2 rounded-lg ${
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
