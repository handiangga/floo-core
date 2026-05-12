import { useState } from "react";
import { formatRupiah } from "../../utils/format";

export default function LoanHistory({ transactions = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      {/* =====================================
          WRAPPER
      ===================================== */}
      <div
        className="
          bg-white
          mt-6
          rounded-[32px]
          shadow-lg
          border
          border-gray-100
          overflow-hidden
        "
      >
        {/* =====================================
            HEADER
        ===================================== */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Riwayat Pembayaran
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Histori seluruh pembayaran cicilan pinjaman.
            </p>
          </div>

          {/* TOTAL */}
          <div className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-2xl text-sm font-semibold">
            {transactions.length} Transaksi
          </div>
        </div>

        {/* =====================================
            EMPTY
        ===================================== */}
        {transactions.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="text-6xl mb-4">📭</div>

            <h3 className="text-lg font-semibold text-gray-700">
              Belum Ada Pembayaran
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              Riwayat transaksi pembayaran akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((trx, index) => (
              <div
                key={trx.id}
                className="
                    p-5
                    flex
                    items-center
                    justify-between
                    gap-4
                    hover:bg-gray-50
                    transition-all
                    duration-300
                  "
              >
                {/* =====================================
                      LEFT
                  ===================================== */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* NUMBER */}
                  <div
                    className="
                        w-10
                        h-10
                        rounded-2xl
                        bg-blue-100
                        text-blue-700
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-sm
                        shrink-0
                      "
                  >
                    {index + 1}
                  </div>

                  {/* IMAGE */}
                  {trx.proof ? (
                    <img
                      src={trx.proof}
                      alt="proof"
                      onClick={() => setSelectedImage(trx.proof)}
                      className="
                          w-14
                          h-14
                          object-cover
                          rounded-2xl
                          cursor-pointer
                          border
                          shadow-sm
                          hover:scale-105
                          hover:shadow-md
                          transition-all
                          duration-300
                          shrink-0
                        "
                    />
                  ) : (
                    <div
                      className="
                          w-14
                          h-14
                          rounded-2xl
                          bg-gray-100
                          flex
                          items-center
                          justify-center
                          text-2xl
                          shrink-0
                        "
                    >
                      📄
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-800">
                      + {formatRupiah(trx.amount)}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <span className="text-gray-300">•</span>

                      <p className="text-xs text-gray-400">
                        {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =====================================
                      RIGHT
                  ===================================== */}
                <div className="shrink-0">
                  <span
                    className="
                        inline-flex
                        items-center
                        gap-2
                        bg-emerald-100
                        text-emerald-700
                        border
                        border-emerald-200
                        px-4
                        py-2
                        rounded-2xl
                        text-xs
                        font-semibold
                      "
                  >
                    <span>✓</span>
                    Berhasil
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================
          IMAGE MODAL
      ===================================== */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="
            fixed
            inset-0
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >
          <div
            className="
              max-w-3xl
              w-full
              animate-in
              fade-in
              zoom-in
              duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE */}
            <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src={selectedImage}
                alt="preview"
                className="
                  w-full
                  max-h-[75vh]
                  object-contain
                  bg-black
                "
              />

              {/* FOOTER */}
              <div className="p-5">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="
                    w-full
                    bg-black
                    hover:bg-gray-800
                    text-white
                    py-4
                    rounded-2xl
                    font-semibold
                    transition-all
                  "
                >
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
