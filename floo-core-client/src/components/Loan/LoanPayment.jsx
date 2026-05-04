import { formatRupiah } from "../../utils/format";

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

      {/* INPUT */}
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
      <label className="border-2 border-dashed p-4 rounded-xl text-center cursor-pointer hover:bg-gray-50">
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setProof(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        {!preview ? (
          "Upload bukti pembayaran"
        ) : (
          <img src={preview} className="w-24 mx-auto rounded" />
        )}
      </label>

      {/* BUTTON */}
      <button
        onClick={handlePay}
        disabled={actionLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
      >
        Bayar Sekarang
      </button>
    </div>
  );
}
