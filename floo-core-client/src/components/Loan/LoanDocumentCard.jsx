import LoanDocumentCard from "./LoanDocumentCard";

export default function LoanDocumentSection({ loan }) {
  console.log("LOAN DOCUMENT =>", loan);

  if (!loan) return null;

  return (
    <div className="space-y-6">
      {/* =====================================
          INFO ALERT
      ===================================== */}
      <div
        className={`
          border
          rounded-[28px]
          p-6
          shadow-sm
          backdrop-blur-sm
          ${
            loan?.status === "paid"
              ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700"
          }
        `}
      >
        <div className="flex items-start gap-4">
          {/* ICON */}
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
              ${loan?.status === "paid" ? "bg-emerald-100" : "bg-green-100"}
            `}
          >
            {loan?.status === "paid" ? "🏆" : "💰"}
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {loan?.status === "paid" ? "Loan Telah Lunas" : "Dokumen Loan"}
            </h3>

            <p className="text-sm mt-1 leading-relaxed opacity-90">
              Seluruh dokumen loan tersedia di bawah ini.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================
          DOCUMENTS
      ===================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DOKUMEN TTD */}
        {loan?.signed_contract_url && (
          <LoanDocumentCard
            title="Dokumen TTD"
            icon="✍️"
            url={loan.signed_contract_url}
            color="violet"
            viewLabel="Lihat TTD"
          />
        )}

        {/* BUKTI PENCAIRAN */}
        {loan?.disbursement_proof && (
          <LoanDocumentCard
            title="Bukti Pencairan"
            icon="💸"
            url={loan.disbursement_proof}
            color="green"
            isImage
            viewLabel="Lihat Bukti"
          />
        )}

        {/* KWITANSI */}
        {loan?.disbursement_receipt_pdf && (
          <LoanDocumentCard
            title="Kwitansi Pencairan"
            icon="🧾"
            url={loan.disbursement_receipt_pdf}
            color="cyan"
            viewLabel="Lihat PDF"
          />
        )}

        {/* SURAT PELUNASAN */}
        {loan?.settlement_letter && (
          <LoanDocumentCard
            title="Surat Pelunasan"
            icon="🏆"
            url={loan.settlement_letter}
            color="emerald"
            viewLabel="Lihat PDF"
          />
        )}
      </div>
    </div>
  );
}
