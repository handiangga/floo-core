import LoanDocumentCard from "./LoanDocumentCard";

export default function LoanDocumentSection({ loan }) {
  if (!loan) return null;

  const hasDocuments =
    loan?.signed_contract_url ||
    loan?.disbursement_proof ||
    loan?.disbursement_receipt_pdf ||
    loan?.settlement_letter;

  if (!hasDocuments) return null;

  return (
    <div className="space-y-5">
      {/* INFO */}
      <div
        className={`border p-5 rounded-2xl ${
          loan?.status === "paid"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-green-50 border-green-200 text-green-700"
        }`}
      >
        {loan?.status === "paid"
          ? "✅ Loan telah lunas."
          : "💰 Dana sudah berhasil dicairkan."}
      </div>

      {/* DOCUMENTS */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* TTD */}
        <LoanDocumentCard
          title="Dokumen TTD"
          icon="✍️"
          url={loan?.signed_contract_url}
          color="violet"
          viewLabel="Lihat TTD"
        />

        {/* BUKTI PENCAIRAN */}
        <LoanDocumentCard
          title="Bukti Pencairan"
          icon="💰"
          url={loan?.disbursement_proof}
          color="green"
          isImage
          viewLabel="Lihat Bukti"
        />

        {/* KWITANSI */}
        <LoanDocumentCard
          title="Kwitansi Pencairan"
          icon="📄"
          url={loan?.disbursement_receipt_pdf}
          color="cyan"
          viewLabel="Lihat PDF"
        />

        {/* SURAT PELUNASAN */}
        <LoanDocumentCard
          title="Surat Pelunasan"
          icon="✅"
          url={loan?.settlement_letter}
          color="emerald"
          viewLabel="Lihat PDF"
        />
      </div>
    </div>
  );
}
