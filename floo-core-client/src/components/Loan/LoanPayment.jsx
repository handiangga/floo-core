import { formatRupiah } from "../../utils/format";
import Swal from "sweetalert2";

export default function LoanPayment({
  loan,
  payAmount,
  setPayAmount,
  handlePay,
  actionLoading,
  parseNumber,
  proof,
  setProof,
  preview,
  setPreview,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🔥 validasi file harus gambar
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "File harus berupa gambar", "error");
      return;
    }

    // 🔥 validasi ukuran max 2MB
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran max 2MB", "error");
      return;
    }

    setProof(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="bg-white p-6 mt-6 rounded-3xl shadow space-y-4">
      <h2 className="font-semibold text-lg">Bayar Cicilan</h2>

      {/* QUICK BUTTON */}
      <div className="flex gap-2">
        <button
          onClick={() => setPayAmount(loan.installment.toLocaleString("id-ID"))}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm"
        >
          Cicil 1x ({formatRupiah(loan.installment)})
        </button>

        <button
          onClick={() =>
            setPayAmount(loan.remaining_amount.toLocaleString("id-ID"))
          }
          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm"
        >
          Lunas ({formatRupiah(loan.remaining_amount)})
        </button>
      </div>

      {/* INPUT + UPLOAD */}
      <div className="space-y-3">
        <input
          value={payAmount}
          onChange={(e) => {
            const raw = parseNumber(e.target.value);
            setPayAmount(raw ? raw.toLocaleString("id-ID") : "");
          }}
          className="border px-4 py-3 rounded-xl w-full text-lg"
          placeholder="Masukkan nominal"
        />

        {/* UPLOAD */}
        <label className="block border-2 border-dashed p-4 rounded-xl text-center cursor-pointer hover:bg-gray-50 transition">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {!preview ? (
            <span className="text-red-500 text-sm">
              * Upload bukti pembayaran (wajib)
            </span>
          ) : (
            <div className="space-y-2">
              <img src={preview} className="w-24 mx-auto rounded" />
              <p className="text-green-600 text-xs">✓ Bukti berhasil dipilih</p>
            </div>
          )}
        </label>
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePay}
        disabled={actionLoading || !proof}
        className={`w-full py-3 rounded-xl font-semibold text-white transition
          ${
            !proof
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >
        {actionLoading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </div>
  );
}
