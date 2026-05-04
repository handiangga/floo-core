import { useState } from "react";
import { formatRupiah } from "../../utils/format";

export default function LoanHistory({ transactions }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="bg-white mt-6 rounded-3xl shadow">
        <div className="p-4 font-semibold border-b">Riwayat Pembayaran</div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Belum ada pembayaran
          </div>
        ) : (
          transactions.map((trx) => (
            <div
              key={trx.id}
              className="p-4 border-t flex items-center justify-between"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                {/* THUMBNAIL */}
                {trx.proof && (
                  <img
                    src={trx.proof}
                    onClick={() => setSelectedImage(trx.proof)}
                    className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                  />
                )}

                <div>
                  <div className="font-medium">
                    + {formatRupiah(trx.amount)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(trx.createdAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-xs text-green-600 font-medium">Berhasil</div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 MODAL PREVIEW */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <div
            className="max-w-lg w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage} className="w-full rounded-xl shadow-lg" />

            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 w-full bg-white text-black py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
