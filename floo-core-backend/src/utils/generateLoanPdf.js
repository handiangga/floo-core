const PDFDocument = require("pdfkit");
const { supabase } = require("../config/supabase");

// 🔥 FORMAT RUPIAH AMAN
const rupiah = (value = 0) => {
  return Number(value).toLocaleString("id-ID");
};

const generateLoanPdf = async (loan, employee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
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

      // =========================
      // TITLE
      // =========================
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("SURAT PERJANJIAN PINJAMAN", {
          align: "center",
        });

      doc.moveDown(2);

      // =========================
      // DATA
      // =========================
      doc.font("Helvetica").fontSize(12);

      doc.text(`Nama: ${employee?.name || "-"}`);
      doc.text(`Jabatan: ${employee?.position || "-"}`);

      doc.text(`Jumlah Pinjaman: Rp ${rupiah(loan?.total_amount)}`);

      doc.text(`Sisa Tagihan: Rp ${rupiah(loan?.remaining_amount)}`);

      doc.text(`Tenor: ${loan?.tenor || 0} bulan`);

      doc.text(`Cicilan: Rp ${rupiah(loan?.installment)}`);

      doc.moveDown(2);

      // =========================
      // PARAGRAF
      // =========================
      doc.text(
        "Saya menyetujui pinjaman ini dan bersedia membayar cicilan sesuai ketentuan perusahaan.",
        {
          align: "justify",
        },
      );

      doc.moveDown(5);

      // =========================
      // TTD
      // =========================
      doc.text("Tanda Tangan Peminjam");

      doc.moveDown(5);

      doc.text("(____________________)");

      // =========================
      // END
      // =========================
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateLoanPdf;
