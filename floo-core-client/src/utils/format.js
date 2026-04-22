// utils/format.js

// 🔥 FORMAT ANGKA TANPA RP (UNTUK INPUT DISPLAY)
export const formatNumber = (num) => {
  if (num === null || num === undefined || num === "") return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

// 🔥 FORMAT RUPIAH (UNTUK UI DISPLAY)
export const formatRupiah = (num) => {
  if (num === null || num === undefined) return "Rp 0";
  return "Rp " + new Intl.NumberFormat("id-ID").format(num);
};

// 🔥 PARSE STRING INPUT KE NUMBER (WAJIB BUAT API)
export const parseNumber = (value) => {
  if (!value) return 0;
  return Number(value.toString().replace(/\D/g, ""));
};
