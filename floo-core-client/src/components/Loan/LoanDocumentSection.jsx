import LoanDocumentCard from "./LoanDocumentCard";

export default function LoanDocumentSection({ loan }) {
  console.log("Loan Full : ", loan);

  if (!loan) return null;

  const hasDocuments =
    loan?.signed_contract_url ||
    loan?.disbursement_proof ||
    loan?.disbursement_receipt_pdf ||
    loan?.settlement_letter;

  if (!hasDocuments) return null;

  const isPaid = loan?.status === "paid";

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
            isPaid
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
              ${isPaid ? "bg-emerald-100" : "bg-green-100"}
            `}
          >
            {isPaid ? "🏆" : "💰"}
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {isPaid ? "Loan Telah Lunas" : "Dana Berhasil Dicairkan"}
            </h3>

            <p className="text-sm mt-1 leading-relaxed opacity-90">
              {isPaid
                ? "Seluruh kewajiban pembayaran pinjaman telah diselesaikan dan surat pelunasan sudah tersedia."
                : "Dana pinjaman telah berhasil dicairkan dan dokumen pencairan sudah tersedia."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================
          DOCUMENTS
      ===================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* =====================================
            DOKUMEN TTD
        ===================================== */}
        <LoanDocumentCard
          title="Dokumen TTD"
          icon="✍️"
          url={loan?.signed_contract_url}
          color="violet"
          viewLabel="Lihat TTD"
        />

        {/* =====================================
            BUKTI PENCAIRAN
        ===================================== */}
        <LoanDocumentCard
          title="Bukti Pencairan"
          icon="💸"
          url={loan?.disbursement_proof}
          color="green"
          isImage
          viewLabel="Lihat Bukti"
        />

        {/* =====================================
            KWITANSI
        ===================================== */}
        <LoanDocumentCard
          title="Kwitansi Pencairan"
          icon="🧾"
          url={loan?.disbursement_receipt_pdf}
          color="cyan"
          viewLabel="Lihat PDF"
        />

        {/* =====================================
            SURAT PELUNASAN
        ===================================== */}
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
