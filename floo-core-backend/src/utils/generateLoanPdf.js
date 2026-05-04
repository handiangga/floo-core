const PDFDocument = require("pdfkit");
const stream = require("stream");
const { supabase } = require("../config/supabase");

const generateLoanPdf = async (loan, employee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);

        const fileName = `contracts/loan-${loan.id}-${Date.now()}.pdf`;

        // 🔥 upload ke Supabase
        const { error } = await supabase.storage
          .from("contracts")
          .upload(fileName, pdfBuffer, {
            contentType: "application/pdf",
          });

        if (error) return reject(error);

        const { data } = supabase.storage
          .from("contracts")
          .getPublicUrl(fileName);

        resolve(data.publicUrl);
      });

      // =========================
      // 🔥 CONTENT PDF
      // =========================
      doc.fontSize(18).text("SURAT PERJANJIAN PINJAMAN", {
        align: "center",
      });

      doc.moveDown();

      doc.fontSize(12).text(`Nama: ${employee.name}`);
      doc.text(`Jabatan: ${employee.position || "-"}`);
      doc.text(
        `Jumlah Pinjaman: Rp ${loan.total_amount.toLocaleString("id-ID")}`,
      );
      doc.text(`Tenor: ${loan.tenor} bulan`);
      doc.text(`Cicilan: Rp ${loan.installment.toLocaleString("id-ID")}`);

      doc.moveDown();

      doc.text(
        "Saya menyetujui pinjaman ini dan bersedia membayar sesuai ketentuan.",
      );

      doc.moveDown(4);

      doc.text("Tanda Tangan:", { align: "left" });

      doc.moveDown(3);

      doc.text("(____________________)");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateLoanPdf;
