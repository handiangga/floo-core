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

  const INTEREST = 5;

  // 🔥 FORMAT
  const formatRupiah = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const parseNumber = (val) => {
    return Number(val.replace(/\D/g, "")) || 0;
  };

  // 🔥 FETCH EMPLOYEE
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

  // 🔥 SIMULASI (OPTIONAL UI)
  const simulation = useMemo(() => {
    if (!emp || !amount) return null;

    const salary = Number(emp.salary || 0);
    const isWeekly = emp.salary_type === "weekly";

    const maxLoan = salary * 2;

    const interestAmount = Math.ceil(amount * (INTEREST / 100));
    const total = amount + interestAmount;

    return {
      maxLoan,
      isWeekly,
      interestAmount,
      total,
    };
  }, [emp, amount]);

  const isOverLimit = simulation && amount > simulation.maxLoan;

  // 🔥 INPUT
  const handleAmount = (val) => {
    const num = parseNumber(val);
    setAmount(num);
    setDisplay(formatRupiah(num));
  };

  // 🔥 SUBMIT (FIXED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !amount) {
      return Swal.fire("Error", "Lengkapi data", "warning");
    }

    if (isOverLimit) {
      return Swal.fire("Error", "Melebihi limit pinjaman", "warning");
    }

    try {
      setLoading(true);

      await api.post("/loans", {
        employee_id: employeeId,
        amount: amount, // ✅ FIX (INI DOANG YANG DIKIRIM)
        interest_rate: INTEREST,
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
            <p className="text-gray-500 text-sm">Simulasi pinjaman + bunga</p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          {/* EMPLOYEE */}
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl"
          >
            <option value="">-- pilih karyawan --</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.position})
              </option>
            ))}
          </select>

          {/* INFO */}
          {emp && (
            <div className="bg-gray-50 p-3 rounded-xl text-sm">
              Gaji:{" "}
              <b>
                Rp {formatRupiah(emp.salary)} ({emp.salary_type})
              </b>
            </div>
          )}

          {/* INPUT */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">Rp</span>

            <input
              value={display}
              onChange={(e) => handleAmount(e.target.value)}
              className="w-full border pl-10 py-3 rounded-xl text-lg font-semibold"
              placeholder="0"
            />
          </div>

          {/* WARNING */}
          {isOverLimit && (
            <div className="text-red-500 text-sm">Melebihi limit pinjaman</div>
          )}

          {/* SIMULASI */}
          {simulation && !isOverLimit && (
            <div className="bg-blue-50 p-4 rounded-xl text-sm space-y-2">
              <p>
                Pokok: <b>Rp {formatRupiah(amount)}</b>
              </p>
              <p>
                Bunga: <b>Rp {formatRupiah(simulation.interestAmount)}</b>
              </p>
              <p>
                Total: <b>Rp {formatRupiah(simulation.total)}</b>
              </p>
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={loading || isOverLimit}
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
