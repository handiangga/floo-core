import { formatRupiah } from "../../utils/format";

export default function TopDebtor({ data = [] }) {
  // 🔥 filter biar gak nampilin yg 0
  const filtered = data.filter((d) => d.total > 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Top Debitur</h2>
        <span className="text-xs text-gray-400">{filtered.length} orang</span>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition p-3 rounded-xl"
            >
              {/* 🔥 LEFT */}
              <div className="flex items-center gap-3">
                {/* ranking */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
                  ${
                    i === 0
                      ? "bg-yellow-100 text-yellow-600"
                      : i === 1
                        ? "bg-gray-200 text-gray-600"
                        : i === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{i + 1}
                </div>

                {/* name */}
                <p className="font-medium text-gray-800">{item.name}</p>
              </div>

              {/* 🔥 RIGHT */}
              <p className="text-red-500 font-semibold">
                {formatRupiah(item.total)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            Tidak ada debitur aktif
          </p>
        )}
      </div>
    </div>
  );
}
