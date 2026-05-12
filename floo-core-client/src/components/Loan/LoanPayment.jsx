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
  // =====================================
  // 🔥 FIX INSTALLMENT
  // =====================================
  const installmentAmount = Math.min(loan.installment, loan.remaining_amount);

  // =====================================
  // FILE CHANGE
  // =====================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // VALIDATE IMAGE
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "File harus berupa gambar", "error");

      return;
    }

    // VALIDATE SIZE
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran maksimal 2MB", "error");

      return;
    }

    setProof(file);

    setPreview(URL.createObjectURL(file));
  };

  // =====================================
  // UI
  // =====================================
  return (
    <div
      className="
        bg-white
        border
        border-gray-100
        rounded-[32px]
        shadow-lg
        p-7
        space-y-6
      "
    >
      {/* =====================================
          HEADER
      ===================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bayar Cicilan</h2>

          <p className="text-sm text-gray-500 mt-1">
            Lakukan pembayaran pinjaman karyawan dengan upload bukti transfer.
          </p>
        </div>

        {/* REMAINING */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-5 py-3">
          <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">
            Sisa Tagihan
          </p>

          <p className="text-xl font-black text-blue-700">
            {formatRupiah(loan.remaining_amount)}
          </p>
        </div>
      </div>

      {/* =====================================
          QUICK BUTTON
      ===================================== */}
      <div className="flex flex-wrap gap-3">
        {/* CICIL */}
        <button
          onClick={() =>
            setPayAmount(installmentAmount.toLocaleString("id-ID"))
          }
          className="
            px-5
            py-3
            rounded-2xl
            bg-blue-100
            text-blue-700
            hover:bg-blue-200
            transition-all
            font-medium
            text-sm
          "
        >
          💳 Cicil 1x ({formatRupiah(installmentAmount)})
        </button>

        {/* LUNAS */}
        <button
          onClick={() =>
            setPayAmount(loan.remaining_amount.toLocaleString("id-ID"))
          }
          className="
            px-5
            py-3
            rounded-2xl
            bg-emerald-100
            text-emerald-700
            hover:bg-emerald-200
            transition-all
            font-medium
            text-sm
          "
        >
          ✅ Lunas ({formatRupiah(loan.remaining_amount)})
        </button>
      </div>

      {/* =====================================
          INPUT
      ===================================== */}
      <div className="space-y-5">
        {/* NOMINAL */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Nominal Pembayaran
          </label>

          <input
            value={payAmount}
            onChange={(e) => {
              const raw = parseNumber(e.target.value);

              setPayAmount(raw ? raw.toLocaleString("id-ID") : "");
            }}
            className="
              w-full
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              text-2xl
              font-bold
              text-gray-800
              focus:ring-4
              focus:ring-blue-100
              focus:border-blue-400
              outline-none
              transition-all
            "
            placeholder="0"
          />
        </div>

        {/* =====================================
            UPLOAD
        ===================================== */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Bukti Pembayaran
          </label>

          <label
            className="
              block
              border-2
              border-dashed
              border-gray-200
              rounded-3xl
              p-6
              text-center
              cursor-pointer
              hover:border-blue-300
              hover:bg-blue-50/30
              transition-all
            "
          >
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {!preview ? (
              <div className="space-y-3">
                <div className="text-5xl">📤</div>

                <div>
                  <p className="font-semibold text-gray-700">
                    Upload Bukti Transfer
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    PNG / JPG / JPEG maksimal 2MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="preview"
                  className="
                    w-32
                    h-32
                    object-cover
                    rounded-2xl
                    mx-auto
                    border
                    shadow-sm
                  "
                />

                <div>
                  <p className="text-green-600 font-semibold">
                    ✓ Bukti berhasil dipilih
                  </p>

                  <p className="text-xs text-gray-400 mt-1">{proof?.name}</p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* =====================================
          BUTTON
      ===================================== */}
      <button
        onClick={handlePay}
        disabled={actionLoading || !proof}
        className={`
          w-full
          py-4
          rounded-2xl
          font-bold
          text-lg
          transition-all
          duration-300
          ${
            !proof
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.01]"
          }
        `}
      >
        {actionLoading ? "Memproses Pembayaran..." : "💳 Bayar Sekarang"}
      </button>
    </div>
  );
}
