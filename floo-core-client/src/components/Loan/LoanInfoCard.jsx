import { formatRupiah } from "../../utils/format";

export default function LoanInfoCard({ loan }) {
  const progress =
    loan.total_amount > 0
      ? ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100
      : 0;

  return (
    <div className="bg-white p-6 rounded-3xl shadow space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total" value={loan.total_amount} />
        <Stat label="Sisa" value={loan.remaining_amount} red />
        <Stat label="Cicilan" value={loan.installment} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
        <div>
          Cair:
          <br />
          {loan.disbursed_at
            ? new Date(loan.disbursed_at).toLocaleDateString("id-ID")
            : "-"}
        </div>

        <div>
          Jatuh Tempo:
          <br />
          {loan.due_date
            ? new Date(loan.due_date).toLocaleDateString("id-ID")
            : "-"}
        </div>

        <div>Status: {loan.status}</div>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className="bg-green-500 h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, red }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold ${red ? "text-red-500" : ""}`}>
        {formatRupiah(value)}
      </p>
    </div>
  );
}
