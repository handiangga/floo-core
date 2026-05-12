import { formatRupiah } from "../../utils/format";

export default function TopOutstanding({ data = [] }) {
  // =====================================================
  // 🔥 FILTER DATA
  // =====================================================
  const filtered = data.filter((d) => Number(d.total) > 0);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      {/* ================================================= */}
      {/* 🔥 HEADER */}
      {/* ================================================= */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-xl text-gray-900">Top Outstanding</h2>

          <p className="text-sm text-gray-500 mt-1">
            Outstanding pinjaman terbesar
          </p>
        </div>

        <span className="text-xs text-gray-400">{filtered.length} orang</span>
      </div>

      {/* ================================================= */}
      {/* 🔥 LIST */}
      {/* ================================================= */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item, i) => {
            // 🔥 SUPPORT ADMIN + OWNER
            const name = item.employee || item.name || "-";

            return (
              <div
                key={i}
                className="
                  flex items-center justify-between
                  border border-gray-100
                  rounded-2xl
                  p-4
                  hover:bg-gray-50
                  transition
                "
              >
                {/* ================================================= */}
                {/* 🔥 LEFT */}
                {/* ================================================= */}
                <div className="flex items-center gap-4">
                  {/* RANK */}
                  <div
                    className={`
                      w-11 h-11
                      flex items-center justify-center
                      rounded-2xl
                      text-sm font-bold
                      shrink-0
                      ${
                        i === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : i === 1
                            ? "bg-gray-200 text-gray-700"
                            : i === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    #{i + 1}
                  </div>

                  {/* INFO */}
                  <div>
                    <p className="font-semibold text-gray-800">{name}</p>

                    <p className="text-sm text-gray-500">Outstanding loan</p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* 🔥 RIGHT */}
                {/* ================================================= */}
                <div className="text-right">
                  <p className="text-red-500 font-bold text-lg">
                    {formatRupiah(item.total)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-400 text-center py-10">
            Tidak ada outstanding loan
          </div>
        )}
      </div>
    </div>
  );
}
