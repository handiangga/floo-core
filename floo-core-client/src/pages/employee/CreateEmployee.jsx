import { useState } from "react";
import Layout from "../../components/layout/LayoutTest";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import { formatNumber } from "../../utils/format";
import UploadPro from "../../components/ui/UploadPro";

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    position: "",
    salary: "",
    salary_type: "",
    phone: "",
    address: "",
  });

  const [salaryDisplay, setSalaryDisplay] = useState("");

  // 🔥 sekarang langsung simpan URL
  const [photo, setPhoto] = useState("");
  const [ktp, setKtp] = useState("");

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewKtp, setPreviewKtp] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSalary = (val) => {
    const raw = val.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, salary: raw }));
    setSalaryDisplay(raw ? formatNumber(raw) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.position || !form.salary || !form.salary_type) {
      return Swal.fire("Error", "Nama, posisi, gaji wajib", "warning");
    }

    try {
      setLoading(true);

      await api.post("/employees", {
        ...form,
        photo: photo,
        ktp_photo: ktp,
      });

      Swal.fire("Berhasil", "Employee ditambahkan", "success");
      navigate("/employees");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || err.message || "Gagal tambah",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Employee</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <UploadPro
            label="Foto Profil"
            preview={previewPhoto}
            setPreview={setPreviewPhoto}
            setValue={setPhoto}
          />

          <UploadPro
            label="Foto KTP"
            preview={previewKtp}
            setPreview={setPreviewKtp}
            setValue={setKtp}
            large
          />

          <Input
            label="Nama"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
          />

          <Select
            label="Posisi"
            value={form.position}
            onChange={(v) => handleChange("position", v)}
            options={[
              { label: "Staff", value: "staff" },
              { label: "Penjahit", value: "penjahit" },
            ]}
          />

          <div>
            <label className="text-sm text-gray-600">Gaji</label>
            <input
              value={salaryDisplay}
              onChange={(e) => handleSalary(e.target.value)}
              className="w-full border px-4 py-2 rounded-xl mt-1"
            />
          </div>

          <Select
            label="Tipe Gaji"
            value={form.salary_type}
            onChange={(v) => handleChange("salary_type", v)}
            options={[
              { label: "Bulanan", value: "monthly" },
              { label: "Mingguan", value: "weekly" },
            ]}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(v) => handleChange("phone", v)}
          />

          <Input
            label="Alamat"
            value={form.address}
            onChange={(v) => handleChange("address", v)}
          />

          <button
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

/* COMPONENT */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        className="w-full border px-4 py-2 rounded-xl mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        className="w-full border px-4 py-2 rounded-xl mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
