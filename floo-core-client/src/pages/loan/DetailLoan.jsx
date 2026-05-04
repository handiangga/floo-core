import { useEffect, useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import { formatRupiah } from "../../utils/format";
import { uploadToSupabase } from "../../utils/uploadSupabase";

export default function DetailLoan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [payAmount, setPayAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);

      // 🔥 ambil loan dulu
      const loanRes = await api.get(`/loans/${id}`);
      setLoan(loanRes.data.data);

      // 🔥 transaksi async (biar cepat)
      setTimeout(async () => {
        try {
          const trxRes = await api.get(`/transactions?loan_id=${id}`);
          setTransactions(trxRes.data?.data?.data || []);
        } catch {
          setTransactions([]);
        }
      }, 0);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ================= DERIVED =================
  const progress =
    loan && loan.total_amount > 0
      ? ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100
      : 0;

  const isPending =
    loan?.status === "pending_manager" || loan?.status === "pending_owner";

  const isOngoing = loan?.status === "ongoing";
  const isCompleted = loan?.status === "completed";

  // ================= STATUS =================
  const getStatusBadge = () => {
    switch (loan.status) {
      case "pending_manager":
        return "bg-yellow-100 text-yellow-600";
      case "pending_owner":
        return "bg-orange-100 text-orange-600";
      case "ongoing":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = () => {
    return loan.status.replace("_", " ");
  };

  // ================= APPROVAL =================
  const handleApproveManager = async () => {
    const confirm = await Swal.fire({
      title: "Approve Manager?",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);

      await api.post(`/loans/${id}/approve-manager`);

      Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Loan lanjut ke owner",
        timer: 1200,
        showConfirmButton: false,
      });

      // 🔥 FIX: JANGAN FETCH LAGI
      setTimeout(() => {
        navigate("/loans");
      }, 1000);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveOwner = async () => {
    const confirm = await Swal.fire({
      title: "Approve Owner & Cairkan?",
      icon: "question",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);

      await api.post(`/loans/${id}/approve-owner`);

      Swal.fire({
        icon: "success",
        title: "Loan dicairkan",
        timer: 1200,
        showConfirmButton: false,
      });

      // 🔥 FIX: redirect juga
      setTimeout(() => {
        navigate("/loans");
      }, 1000);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= PAYMENT =================
  const parseNumber = (val) => Number(val.toString().replace(/\D/g, "")) || 0;

  const handlePay = async () => {
    try {
      const amount = parseNumber(payAmount);

      if (!amount) return Swal.fire("Error", "Isi nominal", "warning");

      if (!proof) return Swal.fire("Error", "Upload bukti", "warning");

      if (amount > loan.remaining_amount) {
        return Swal.fire("Error", "Melebihi sisa pinjaman", "warning");
      }

      const confirm = await Swal.fire({
        title: "Konfirmasi",
        text: formatRupiah(amount),
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      setActionLoading(true);

      const proofUrl = await uploadToSupabase(proof, {
        bucket: "transaction",
        prefix: `loan-${id}`,
      });

      await api.post("/transactions", {
        loan_id: id,
        amount,
        proof: proofUrl,
      });

      Swal.fire("Success", "Pembayaran berhasil", "success");

      setPayAmount("");
      setProof(null);
      setPreview(null);

      fetchData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <Layout>
        <div className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
      </Layout>
    );
  }

  if (!loan) return <Layout>Data tidak ditemukan</Layout>;

  // ================= UI =================
  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => navigate("/loans")} className="text-sm mb-1">
            ← Kembali
          </button>

          <h1 className="text-2xl font-bold">Loan Detail</h1>
          <p className="text-gray-500 text-sm">{loan.Employee?.name}</p>
        </div>

        <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadge()}`}>
          {getStatusLabel()}
        </span>
      </div>

      {/* INFO */}
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

      {/* APPROVAL BUTTONS */}
      {loan.status === "pending_manager" && user?.role === "manager" && (
        <button
          onClick={handleApproveManager}
          disabled={actionLoading}
          className="mt-4 w-full bg-yellow-500 text-white py-3 rounded-xl"
        >
          Approve Manager
        </button>
      )}

      {loan.status === "pending_owner" && user?.role === "owner" && (
        <button
          onClick={handleApproveOwner}
          disabled={actionLoading}
          className="mt-4 w-full bg-orange-500 text-white py-3 rounded-xl"
        >
          Approve Owner & Cairkan
        </button>
      )}

      {/* INFO PENDING */}
      {isPending && (
        <div className="bg-yellow-50 p-4 mt-4 rounded-xl text-yellow-600 text-sm">
          ⏳ Menunggu approval sebelum bisa dibayar
        </div>
      )}

      {/* PAYMENT */}
      {isOngoing && (
        <div className="bg-white p-6 mt-6 rounded-3xl shadow space-y-4">
          <h2 className="font-semibold">Bayar Cicilan</h2>

          <input
            value={payAmount}
            onChange={(e) => {
              const raw = parseNumber(e.target.value);
              setPayAmount(raw ? raw.toLocaleString("id-ID") : "");
            }}
            className="border px-4 py-3 rounded-xl w-full"
            placeholder="0"
          />

          <label className="border-2 border-dashed p-4 rounded-xl text-center cursor-pointer">
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

          <button
            onClick={handlePay}
            disabled={actionLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl"
          >
            Bayar
          </button>
        </div>
      )}

      {/* HISTORY */}
      <div className="bg-white mt-6 rounded-3xl shadow">
        <div className="p-4 font-semibold border-b">Riwayat Pembayaran</div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Belum ada pembayaran
          </div>
        ) : (
          transactions.map((trx) => (
            <div key={trx.id} className="p-4 border-t">
              + {formatRupiah(trx.amount)}
            </div>
          ))
        )}
      </div>
    </Layout>
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
