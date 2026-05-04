import { formatRupiah } from "../../utils/format";

export default function LoanHistory({ transactions }) {
  return (
    <div className="bg-white mt-6 rounded-3xl shadow">
      <div className="p-4 font-semibold border-b">Riwayat Pembayaran</div>

      {transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          Belum ada pembayaran
        </div>
      ) : (
        transactions.map((trx) => (
          <div key={trx.id} className="p-4 border-t flex justify-between">
            <span>+ {formatRupiah(trx.amount)}</span>
            <span className="text-xs text-gray-400">
              {new Date(trx.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
