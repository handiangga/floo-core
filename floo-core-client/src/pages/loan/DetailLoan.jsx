import Layout from "../../components/layout/LayoutTest";

import LoanInfoCard from "../../components/Loan/LoanInfoCard";
import LoanActions from "../../components/Loan/LoanActions";
import LoanPayment from "../../components/Loan/LoanPayment";
import LoanHistory from "../../components/Loan/LoanHistory";

import LoanDocumentSection from "../../components/Loan/LoanDocumentSection";
import LoanStatusAlert from "../../components/Loan/LoanStatusAlert";

import useDetailLoan from "../../hooks/useDetailLoan";

export default function DetailLoan() {
  const {
    // DATA
    loan,
    transactions,

    // STATE
    loading,
    paymentLoading,
    disburseLoading,

    // FORM
    amount,
    setAmount,

    note,
    setNote,

    proofFile,
    setProofFile,

    // STATUS
    isSigned,
    canPay,

    // ACTION
    handlePayment,
    handleDisburse,

    // NAV
    navigate,
  } = useDetailLoan();

  // ======================================
  // LOADING
  // ======================================
  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-3xl p-10 border text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-52 bg-gray-200 rounded mx-auto" />

              <div className="h-4 w-72 bg-gray-100 rounded mx-auto" />

              <div className="h-40 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================
  if (!loan) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white border rounded-3xl p-10 text-center">
            <p className="text-gray-500">Loan tidak ditemukan</p>

            <button
              onClick={() => navigate("/loans")}
              className="mt-5 bg-black text-white px-5 py-3 rounded-2xl"
            >
              Kembali
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ======================================
  // UI
  // ======================================
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate("/loans")}
              className="text-sm mb-3 text-gray-500 hover:text-black transition"
            >
              ← Kembali
            </button>

            <h1 className="text-3xl font-bold text-gray-800">Detail Loan</h1>

            <p className="text-gray-500 mt-1">{loan.Employee?.name || "-"}</p>
          </div>

          {/* STATUS BADGE */}
          <div>
            <span
              className={`
                px-4
                py-2
                rounded-2xl
                text-sm
                font-semibold
                border
                ${
                  loan.status === "paid"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : loan.status === "ongoing"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : loan.status === "signed"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : loan.status.includes("reject")
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                }
              `}
            >
              {loan.status.replaceAll("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* ======================================
            STATUS ALERT
        ====================================== */}
        <LoanStatusAlert loan={loan} />

        {/* ======================================
            INFO CARD
        ====================================== */}
        <LoanInfoCard loan={loan} />

        {/* ======================================
            ACTIONS
        ====================================== */}
        <LoanActions loan={loan} />

        {/* ======================================
            DISBURSE UPLOAD
        ====================================== */}
        {isSigned && (
          <div className="bg-white border rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Upload Bukti Pencairan
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Upload bukti transfer sebelum mencairkan dana pinjaman.
              </p>
            </div>

            {/* FILE */}
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="
                  w-full
                  border
                  rounded-2xl
                  p-4
                  text-sm
                "
              />

              {proofFile && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">
                  ✅ {proofFile.name}
                </div>
              )}
            </div>

            {/* ACTION */}
            <button
              onClick={handleDisburse}
              disabled={disburseLoading}
              className="
                bg-black
                hover:bg-gray-800
                text-white
                px-6
                py-3
                rounded-2xl
                transition
                font-medium
                disabled:opacity-50
              "
            >
              {disburseLoading ? "Memproses..." : "Cairkan Dana"}
            </button>
          </div>
        )}

        {/* ======================================
            DOCUMENTS
        ====================================== */}
        <LoanDocumentSection loan={loan} />

        {/* ======================================
            PAYMENT
        ====================================== */}
        {canPay && (
          <LoanPayment
            amount={amount}
            setAmount={setAmount}
            note={note}
            setNote={setNote}
            proofFile={proofFile}
            setProofFile={setProofFile}
            handlePayment={handlePayment}
            paymentLoading={paymentLoading}
            loan={loan}
          />
        )}

        {/* ======================================
            HISTORY
        ====================================== */}
        <LoanHistory transactions={transactions} />
      </div>
    </Layout>
  );
}
