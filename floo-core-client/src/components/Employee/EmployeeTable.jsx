import EmployeeRow from "./EmployeeRow";

export default function EmployeeTable({ data, loading, navigate, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead className="sticky top-0 bg-white z-10 shadow-sm text-gray-500">
            <tr className="text-xs uppercase tracking-wide">
              <th className="p-4 text-left font-medium">Foto</th>
              <th className="p-4 text-left font-medium">Nama</th>
              <th className="p-4 text-left font-medium">Posisi</th>
              <th className="p-4 text-left font-medium">Gaji</th>
              <th className="p-4 text-left font-medium">Phone</th>
              <th className="p-4 text-left font-medium">Alamat</th>
              <th className="p-4 text-center font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {/* 🔄 LOADING SKELETON */}
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t animate-pulse">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="p-4">
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              /* 📭 EMPTY STATE */
              <tr>
                <td colSpan="7" className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">Tidak ada data ditemukan</p>
                    <button
                      onClick={() => navigate("/employees/create")}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Tambah karyawan pertama
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              /* ✅ DATA */
              data.map((item, index) => (
                <EmployeeRow
                  key={item.id}
                  item={item}
                  index={index} // 🔥 penting buat zebra
                  navigate={navigate}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
