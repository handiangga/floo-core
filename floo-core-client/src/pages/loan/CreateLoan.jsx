import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";

export default function CreateLoan() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [amount, setAmount] = useState(0);
  const [display, setDisplay] = useState("");
  const [tenor, setTenor] = useState(1);

  const INTEREST = 5;

  const formatRupiah = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const parseNumber = (val) => {
    return Number(val.replace(/\D/g, "")) || 0;
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res?.data?.data?.data || []);
    } catch {
      Swal.fire("Error", "Gagal ambil employee", "error");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const emp = useMemo(() => {
    return employees.find((e) => e.id == employeeId);
  }, [employeeId, employees]);

  const simulation = useMemo(() => {
    if (!emp || !amount || !tenor) return null;

    const salary = Number(emp.salary || 0);
    const isWeekly = emp.salary_type === "weekly";

    const maxLoan = salary * 2;

    const interestAmount = Math.ceil(amount * (INTEREST / 100));
    const total = amount + interestAmount;

    const installment = Math.ceil(total / tenor);

    return {
      maxLoan,
      isWeekly,
      interestAmount,
      total,
      installment,
    };
  }, [emp, amount, tenor]);

  const isOverLimit = simulation && amount > simulation.maxLoan;
  const isOverInstallment =
    simulation && emp && simulation.installment > emp.salary * 0.5;

  const handleAmount = (val) => {
    const num = parseNumber(val);
    setAmount(num);
    setDisplay(formatRupiah(num));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !amount || !tenor) {
      return Swal.fire("Error", "Lengkapi data", "warning");
    }

    if (isOverLimit) {
      return Swal.fire("Error", "Melebihi limit pinjaman", "warning");
    }

    if (isOverInstallment) {
      return Swal.fire("Error", "Cicilan terlalu besar", "warning");
    }

    try {
      setLoading(true);

      await api.post("/loans", {
        employee_id: employeeId,
        amount,
        interest_rate: INTEREST,
        tenor,
      });

      Swal.fire("Berhasil", "Loan dibuat", "success");
      navigate("/loans");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal membuat loan",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/loans")}
            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            ← Kembali
          </button>

          <div>
            <h1 className="text-2xl font-bold">Buat Pinjaman</h1>
            <p className="text-gray-500 text-sm">
              Simulasi pinjaman & cicilan otomatis
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 border">
          {/* EMPLOYEE */}
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- pilih karyawan --</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.position})
              </option>
            ))}
          </select>

          {/* INFO GAJI */}
          {emp && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl text-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500">Gaji</p>
                <p className="font-semibold text-lg">
                  Rp {formatRupiah(emp.salary)}
                </p>
              </div>
              <span className="text-xs bg-blue-100 px-3 py-1 rounded-full">
                {emp.salary_type}
              </span>
            </div>
          )}

          {/* INPUT NOMINAL */}
          <div>
            <label className="text-sm text-gray-500">Jumlah Pinjaman</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-3 text-gray-400">Rp</span>
              <input
                value={display}
                onChange={(e) => handleAmount(e.target.value)}
                className="w-full border pl-10 py-3 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-blue-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* TENOR */}
          <div>
            <label className="text-sm text-gray-500">Tenor</label>
            <select
              value={tenor}
              onChange={(e) => setTenor(Number(e.target.value))}
              className="w-full border px-4 py-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-400"
            >
              <option value={1}>1 bulan</option>
              <option value={2}>2 bulan</option>
              <option value={3}>3 bulan</option>
              <option value={6}>6 bulan</option>
            </select>
          </div>

          {/* WARNING */}
          {isOverLimit && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              ⚠️ Melebihi limit pinjaman (max 2x gaji)
            </div>
          )}

          {isOverInstallment && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              ⚠️ Cicilan terlalu besar (max 50% gaji)
            </div>
          )}

          {/* SIMULASI */}
          {simulation && !isOverLimit && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex justify-between">
                <span>Pokok</span>
                <b>Rp {formatRupiah(amount)}</b>
              </div>
              <div className="flex justify-between">
                <span>Bunga ({INTEREST}%)</span>
                <b>Rp {formatRupiah(simulation.interestAmount)}</b>
              </div>
              <div className="flex justify-between border-t border-white/30 pt-2">
                <span>Total</span>
                <b>Rp {formatRupiah(simulation.total)}</b>
              </div>

              <div className="bg-white text-black p-3 rounded-xl text-center mt-3">
                <p className="text-sm text-gray-500">Cicilan per periode</p>
                <p className="text-xl font-bold">
                  Rp {formatRupiah(simulation.installment)}
                </p>
                <p className="text-xs text-gray-400">
                  / {tenor} {simulation.isWeekly ? "minggu" : "bulan"}
                </p>
              </div>
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={loading || isOverLimit || isOverInstallment}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Pinjaman"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
