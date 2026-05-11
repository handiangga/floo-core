const PDFDocument = require("pdfkit");
const { supabase } = require("../config/supabase");

// =========================
// FORMAT RUPIAH
// =========================
const rupiah = (value = 0) => {
  return Number(value).toLocaleString("id-ID");
};

const generateLoanPdf = async (loan, employee) => {
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

          const fileName = `loan-${loan.id}-${Date.now()}.pdf`;

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
      // HEADER PERUSAHAAN
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
      // JUDUL
      // =====================================================
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("SURAT PERJANJIAN PINJAMAN DANA KARYAWAN", {
          align: "center",
        });

      doc.moveDown(0.5);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(`Nomor : ${loan?.id || "-"}/SPP/FF/2026`, {
          align: "center",
        });

      doc.moveDown(2);

      // =====================================================
      // PEMBUKAAN
      // =====================================================
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          "Pada hari ini, pihak yang bertanda tangan di bawah ini sepakat untuk mengadakan perjanjian pinjaman dana karyawan dengan ketentuan sebagai berikut:",
          {
            align: "justify",
          },
        );

      doc.moveDown(1.5);

      // =====================================================
      // PIHAK PERTAMA
      // =====================================================
      doc.font("Helvetica-Bold").text("PIHAK PERTAMA");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text("Nama Perusahaan : Floo Fashionn");
      doc.text("Diwakili Oleh     : Abidin Angga");
      doc.text("Jabatan           : Manager");

      doc.moveDown(1);

      // =====================================================
      // PIHAK KEDUA
      // =====================================================
      doc.font("Helvetica-Bold").text("PIHAK KEDUA");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text(`Nama              : ${employee?.name || "-"}`);
      doc.text(`Jabatan           : ${employee?.position || "-"}`);
      doc.text(`Jumlah Pinjaman   : Rp ${rupiah(loan?.total_amount)}`);
      doc.text(`Sisa Tagihan      : Rp ${rupiah(loan?.remaining_amount)}`);
      doc.text(`Tenor             : ${loan?.tenor || 0} bulan`);
      doc.text(`Cicilan           : Rp ${rupiah(loan?.installment)}`);

      doc.moveDown(2);

      // =====================================================
      // PASAL 1
      // =====================================================
      doc.font("Helvetica-Bold").text("PASAL 1");
      doc.text("JUMLAH PINJAMAN");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text(
        `PIHAK PERTAMA memberikan pinjaman kepada PIHAK KEDUA sebesar Rp ${rupiah(
          loan?.total_amount,
        )} (${loan?.total_amount_text || ""}).`,
        {
          align: "justify",
        },
      );

      doc.moveDown(1.5);

      // =====================================================
      // PASAL 2
      // =====================================================
      doc.font("Helvetica-Bold").text("PASAL 2");
      doc.text("JANGKA WAKTU DAN CICILAN");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text(
        `1. Jangka waktu pinjaman adalah selama ${
          loan?.tenor || 0
        } (${loan?.tenor || 0}) bulan.`,
        {
          align: "justify",
        },
      );

      doc.moveDown(0.5);

      doc.text(
        `2. PIHAK KEDUA wajib membayar cicilan sebesar Rp ${rupiah(
          loan?.installment,
        )}.`,
        {
          align: "justify",
        },
      );

      doc.moveDown(0.3);

      doc.text("- per bulan untuk karyawan dengan sistem gaji bulanan;");

      doc.text("- atau per minggu untuk karyawan dengan sistem gaji mingguan.");

      doc.moveDown(0.5);

      doc.text(
        "3. Pembayaran dilakukan melalui pemotongan gaji atau metode lain yang disetujui oleh perusahaan.",
        {
          align: "justify",
        },
      );

      doc.moveDown(1.5);

      // =====================================================
      // PASAL 3
      // =====================================================
      doc.font("Helvetica-Bold").text("PASAL 3");
      doc.text("KEWAJIBAN PIHAK KEDUA");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text("1. Membayar cicilan tepat waktu sesuai ketentuan perusahaan.");

      doc.text(
        "2. Menjaga komunikasi dengan perusahaan terkait pembayaran pinjaman.",
      );

      doc.text(
        "3. Melunasi seluruh sisa pinjaman apabila mengundurkan diri atau terkena pemutusan hubungan kerja sebelum tenor berakhir.",
      );

      doc.moveDown(1.5);

      // =====================================================
      // PASAL 4
      // =====================================================
      doc.font("Helvetica-Bold").text("PASAL 4");
      doc.text("KETERLAMBATAN PEMBAYARAN");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text(
        "1. Apabila terjadi keterlambatan pembayaran, maka PIHAK PERTAMA berhak memberikan teguran kepada PIHAK KEDUA.",
      );

      doc.text(
        "2. Perusahaan berhak melakukan pemotongan gaji sesuai ketentuan yang berlaku.",
      );

      doc.text(
        "3. Keterlambatan pembayaran tidak menghapus kewajiban PIHAK KEDUA untuk melunasi pinjaman.",
      );

      doc.moveDown(1.5);

      // =====================================================
      // PASAL 5
      // =====================================================
      doc.font("Helvetica-Bold").text("PASAL 5");
      doc.text("PENUTUP");

      doc.moveDown(0.5);

      doc.font("Helvetica");

      doc.text(
        "Surat perjanjian ini dibuat dengan sebenar-benarnya dalam keadaan sadar tanpa adanya paksaan dari pihak manapun dan berlaku sejak tanggal ditandatangani.",
        {
          align: "justify",
        },
      );

      doc.moveDown(4);

      // =====================================================
      // TTD
      // =====================================================
      const currentY = doc.y;

      doc.text("PIHAK PERTAMA", 100, currentY, {
        align: "center",
        width: 150,
      });

      doc.text("PIHAK KEDUA", 320, currentY, {
        align: "center",
        width: 150,
      });

      doc.moveDown(5);

      const signY = doc.y;

      doc.text("( Abidin Angga )", 100, signY, {
        align: "center",
        width: 150,
      });

      doc.text(`( ${employee?.name || "-"} )`, 320, signY, {
        align: "center",
        width: 150,
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

module.exports = generateLoanPdf;
