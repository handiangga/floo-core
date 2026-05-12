const PDFDocument = require("pdfkit");
const { supabase } = require("../config/supabase");

// =========================
// FORMAT RUPIAH
// =========================
const rupiah = (value = 0) => {
  return Number(value).toLocaleString("id-ID");
};

// =========================
// TERBILANG
// =========================
const penyebut = (nilai) => {
  nilai = Math.floor(nilai);

  const huruf = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  if (nilai < 12) {
    return huruf[nilai];
  }

  if (nilai < 20) {
    return penyebut(nilai - 10) + " Belas";
  }

  if (nilai < 100) {
    return penyebut(Math.floor(nilai / 10)) + " Puluh " + penyebut(nilai % 10);
  }

  if (nilai < 200) {
    return "Seratus " + penyebut(nilai - 100);
  }

  if (nilai < 1000) {
    return (
      penyebut(Math.floor(nilai / 100)) + " Ratus " + penyebut(nilai % 100)
    );
  }

  if (nilai < 2000) {
    return "Seribu " + penyebut(nilai - 1000);
  }

  if (nilai < 1000000) {
    return (
      penyebut(Math.floor(nilai / 1000)) + " Ribu " + penyebut(nilai % 1000)
    );
  }

  if (nilai < 1000000000) {
    return (
      penyebut(Math.floor(nilai / 1000000)) +
      " Juta " +
      penyebut(nilai % 1000000)
    );
  }

  return "";
};

const terbilang = (nilai) => {
  return penyebut(nilai).replace(/\s+/g, " ").trim() + " Rupiah";
};

const generateDisbursementReceiptPdf = async (loan, employee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const buffers = [];

      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          const fileName = `receipt-${loan.id}-${Date.now()}.pdf`;

          // =========================
          // UPLOAD SUPABASE
          // =========================
          const { error } = await supabase.storage
            .from("contracts")
            .upload(fileName, pdfBuffer, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (error) {
            return reject(error);
          }

          const { data } = supabase.storage
            .from("contracts")
            .getPublicUrl(fileName);

          resolve(data.publicUrl);
        } catch (err) {
          reject(err);
        }
      });

      // =====================================================
      // HEADER
      // =====================================================
      doc.font("Helvetica-Bold").fontSize(18).text("FLOO FASHIONN", {
        align: "center",
      });

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("Jl. Tabung, Tiyasan, Condong Catur, Depok, Sleman, Yogyakarta", {
          align: "center",
        });

      doc.text("Telepon : 081235898162", {
        align: "center",
      });

      doc.text("Email : floofashionn@gmail.com", {
        align: "center",
      });

      doc.moveDown(1);

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      doc.moveDown(2);

      // =====================================================
      // TITLE
      // =====================================================
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("KWITANSI PENCAIRAN PINJAMAN", {
          align: "center",
        });

      doc.moveDown(2);

      // =====================================================
      // NOMOR
      // =====================================================
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`No. Kwitansi : KW-${loan?.id || "-"}`);

      doc.moveDown(1.5);

      // =====================================================
      // CONTENT
      // =====================================================
      doc.text("Sudah diterima dari :", {
        continued: true,
      });

      doc.font("Helvetica-Bold").text(" Floo Fashionn");

      doc.moveDown(1);

      doc.font("Helvetica");

      doc.text("Nama Penerima", 50);
      doc.text(`: ${employee?.name || "-"}`, 220, doc.y - 15);

      doc.text("Jabatan", 50);
      doc.text(`: ${employee?.position || "-"}`, 220, doc.y - 15);

      doc.text("Jumlah Pencairan", 50);
      doc.text(`: Rp ${rupiah(loan?.principal_amount)}`, 220, doc.y - 15);

      doc.text("Metode Pencairan", 50);
      doc.text(
        `: ${loan?.disbursement_method || "Transfer / Cash"}`,
        220,
        doc.y - 15,
      );

      doc.text("Keperluan", 50);
      doc.text(": Pencairan pinjaman karyawan", 220, doc.y - 15);

      // ✅ FIX TANGGAL
      const disbursementDate = loan?.disbursed_at
        ? new Date(loan.disbursed_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-";

      doc.text("Tanggal Pencairan", 50);

      doc.text(`: ${disbursementDate}`, 220, doc.y - 15);

      doc.moveDown(2);

      // =====================================================
      // JUMLAH TERBILANG
      // =====================================================
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(`Rp ${rupiah(loan?.principal_amount)}`, {
          align: "center",
        });

      doc.moveDown(1);

      // ✅ FIX TERBILANG
      doc
        .font("Helvetica-Oblique")
        .fontSize(11)
        .text(`"${terbilang(loan?.principal_amount || 0)}"`, {
          align: "center",
        });

      doc.moveDown(4);

      // =====================================================
      // TTD
      // =====================================================
      const currentY = doc.y;

      doc.font("Helvetica").fontSize(12).text("Penerima", 90, currentY, {
        align: "center",
        width: 150,
      });

      doc.text("Finance/Admin", 320, currentY, {
        align: "center",
        width: 150,
      });

      doc.moveDown(5);

      const signY = doc.y;

      doc.text(`( ${employee?.name || "-"} )`, 90, signY, {
        align: "center",
        width: 150,
      });

      doc.text("( Abidin Angga )", 320, signY, {
        align: "center",
        width: 150,
      });

      // =====================================================
      // FOOTER
      // =====================================================
      doc.moveDown(3);

      doc
        .fontSize(9)
        .fillColor("gray")
        .text("Dokumen ini dibuat secara otomatis oleh sistem Floo Fashionn.", {
          align: "center",
        });

      // =====================================================
      // END PDF
      // =====================================================
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateDisbursementReceiptPdf;
