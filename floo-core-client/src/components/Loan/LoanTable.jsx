import LoanRow from "./LoanRow";
import { Wallet } from "lucide-react";

export default function LoanTable({ data, loading, navigate, onDelete }) {
  return (
    <div
      className="
        bg-white
        rounded-[32px]
        shadow-sm
        border
        border-gray-100
        overflow-hidden
      "
    >
      {/* =====================================
          HEADER
      ===================================== */}
      <div
        className="
          flex
          items-center
          justify-between
          px-6
          py-5
          border-b
          border-gray-100
          bg-gradient-to-r
          from-white
          to-gray-50
        "
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Loan</h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitoring seluruh pinjaman karyawan
          </p>
        </div>

        {/* TOTAL */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            bg-blue-50
            border
            border-blue-100
            px-4
            py-3
            rounded-2xl
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-blue-100
              flex
              items-center
              justify-center
              text-blue-600
            "
          >
            <Wallet size={18} />
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Data</p>

            <p className="font-bold text-gray-800">{data.length} Loan</p>
          </div>
        </div>
      </div>

      {/* =====================================
          TABLE
      ===================================== */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          {/* =====================================
              HEAD
          ===================================== */}
          <thead
            className="
              bg-gray-50/80
              text-gray-500
              text-sm
            "
          >
            <tr>
              <th className="px-6 py-5 text-left font-semibold">Karyawan</th>

              <th className="px-6 py-5 text-left font-semibold">Total</th>

              <th className="px-6 py-5 text-left font-semibold">Sisa</th>

              <th className="px-6 py-5 text-left font-semibold min-w-[280px]">
                Progress
              </th>

              <th className="px-6 py-5 text-left font-semibold">Status</th>

              <th className="px-6 py-5 text-left font-semibold">Aksi</th>
            </tr>
          </thead>

          {/* =====================================
              BODY
          ===================================== */}
          <tbody>
            {/* LOADING */}
            {loading ? (
              <tr>
                <td colSpan="6" className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    {/* SPINNER */}
                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        border-4
                        border-blue-100
                        border-t-blue-500
                        animate-spin
                      "
                    />

                    <p className="mt-4 text-gray-500 font-medium">
                      Memuat data loan...
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    {/* ICON */}
                    <div
                      className="
                        w-20
                        h-20
                        rounded-3xl
                        bg-gray-100
                        flex
                        items-center
                        justify-center
                        text-4xl
                      "
                    >
                      📭
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-700">
                      Belum Ada Loan
                    </h3>

                    <p className="mt-2 text-sm text-gray-400 max-w-sm">
                      Data pinjaman karyawan akan muncul di sini.
                    </p>
                  </div>
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
    </div>
  );
}
