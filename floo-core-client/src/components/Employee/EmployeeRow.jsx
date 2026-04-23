import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatRupiah } from "../../utils/format";
import { useMemo } from "react";

export default function EmployeeRow({ item, onDelete, navigate, index }) {
  const getBadge = (pos) => {
    if (pos === "staff")
      return "bg-blue-50 text-blue-600 border border-blue-100";
    if (pos === "penjahit")
      return "bg-green-50 text-green-600 border border-green-100";
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  // 🔥 FIX: stabilkan src (hindari null / undefined / invalid)
  const imageSrc = useMemo(() => {
    if (!item.photo || item.photo === "null") {
      return "/default-avatar.png";
    }

    if (typeof item.photo === "string" && item.photo.startsWith("http")) {
      return item.photo;
    }

    return "/default-avatar.png";
  }, [item.photo]);

  return (
    <tr
      className={`
        ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
        hover:bg-blue-50/60
        transition-all duration-200
        border-t
      `}
    >
      {/* FOTO */}
      <td className="p-4">
        <img
          key={imageSrc} // 🔥 penting biar React gak reload loop
          src={imageSrc}
          loading="lazy"
          draggable={false}
          className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
        />
      </td>

      {/* NAMA */}
      <td className="p-4 font-semibold text-gray-800">{item.name}</td>

      {/* POSISI */}
      <td className="p-4">
        <span
          className={`
            px-3 py-1 text-xs rounded-full font-medium shadow-sm
            ${getBadge(item.position)}
          `}
        >
          {item.position}
        </span>
      </td>

      {/* GAJI */}
      <td className="p-4">
        <div className="font-medium text-gray-800">
          {formatRupiah(item.salary)}
        </div>
        <div className="text-xs text-gray-400">{item.salary_type}</div>
      </td>

      {/* PHONE */}
      <td className="p-4 text-gray-700">{item.phone || "-"}</td>

      {/* ALAMAT */}
      <td className="p-4 text-gray-600 max-w-[180px] truncate">
        {item.address || "-"}
      </td>

      {/* ACTION */}
      <td className="p-4">
        <div className="flex justify-center gap-2 items-center">
          <button
            onClick={() => navigate(`/employees/${item.id}`)}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition shadow-sm hover:scale-105"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => navigate(`/employees/edit/${item.id}`)}
            className="p-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-lg transition shadow-sm hover:scale-105"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition shadow-sm hover:scale-105"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
