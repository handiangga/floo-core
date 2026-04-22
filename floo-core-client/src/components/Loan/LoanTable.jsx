import LoanRow from "./LoanRow";

export default function LoanTable({ data, loading, navigate, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Karyawan</th>
            <th className="p-4 text-left">Total</th>
            <th className="p-4 text-left">Sisa</th>
            <th className="p-4 text-left">Progress</th> {/* 🔥 NEW */}
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-400">
                Belum ada loan
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <LoanRow
                key={item.id}
                item={item}
                navigate={navigate}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
