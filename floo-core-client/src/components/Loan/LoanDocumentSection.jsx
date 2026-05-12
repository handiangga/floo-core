import LoanDocumentCard from "./LoanDocumentCard";

export default function LoanDocumentSection({ loan }) {
  if (!loan) return null;

  const isPaid = loan?.status === "paid";

  return (
    <div className="space-y-6">
      {/* INFO */}
      <div
        className={`
          border
          rounded-[28px]
          p-6
          shadow-sm
          ${
            isPaid
              ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700"
          }
        `}
      >
        <div className="flex items-start gap-4">
          <div
            className={`
              w-12
              h-12
              rounded-2xl
              flex
              items-center
              justify-center
              text-2xl
              shadow-sm
              ${isPaid ? "bg-emerald-100" : "bg-green-100"}
            `}
          >
            {isPaid ? "🏆" : "💰"}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {isPaid ? "Loan Telah Lunas" : "Dokumen Loan"}
            </h3>

            <p className="text-sm mt-1 leading-relaxed opacity-90">
              Seluruh dokumen loan tersedia di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* DOCUMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoanDocumentCard
          title="Dokumen TTD"
          icon="✍️"
          url={loan?.signed_contract_url}
          color="violet"
          viewLabel="Lihat TTD"
        />

        <LoanDocumentCard
          title="Bukti Pencairan"
          icon="💸"
          url={loan?.disbursement_proof}
          color="green"
          isImage
          viewLabel="Lihat Bukti"
        />

        <LoanDocumentCard
          title="Kwitansi Pencairan"
          icon="🧾"
          url={loan?.disbursement_receipt_pdf}
          color="cyan"
          viewLabel="Lihat PDF"
        />

        <LoanDocumentCard
          title="Surat Pelunasan"
          icon="🏆"
          url={loan?.settlement_letter}
          color="emerald"
          viewLabel="Lihat PDF"
        />
      </div>
    </div>
  );
}
