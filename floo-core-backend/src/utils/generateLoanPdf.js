const PDFDocument = require("pdfkit");
const { supabase } = require("../config/supabase");

const generateLoanPdf = async (loan, employee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
      });

      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));

      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          // 🔥 FIX JANGAN ADA contracts/
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
      // HEADER
      // =========================
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("SURAT PERJANJIAN PINJAMAN", {
          align: "center",
        });

      doc.moveDown(2);

      // =========================
      // DATA EMPLOYEE
      // =========================
      doc.font("Helvetica").fontSize(12);

      doc.text(`Nama               : ${employee.name}`);
      doc.text(`Jabatan            : ${employee.position || "-"}`);
      doc.text(
        `Jumlah Pinjaman    : Rp ${loan.total_amount.toLocaleString("id-ID")}`,
      );
      doc.text(
        `Sisa Tagihan       : Rp ${loan.remaining_amount.toLocaleString(
          "id-ID",
        )}`,
      );
      doc.text(`Tenor              : ${loan.tenor} bulan`);
      doc.text(
        `Cicilan            : Rp ${loan.installment.toLocaleString("id-ID")}`,
      );

      doc.moveDown(2);

      // =========================
      // PERJANJIAN
      // =========================
      doc.text(
        "Saya menyatakan menyetujui pinjaman ini dan bersedia melakukan pembayaran cicilan sesuai ketentuan yang berlaku di perusahaan.",
        {
          align: "justify",
          lineGap: 5,
        },
      );

      doc.moveDown(5);

      // =========================
      // SIGN AREA
      // =========================
      doc.text("Peminjam,", {
        align: "left",
      });

      doc.moveDown(5);

      doc.text("(________________________)");

      // =========================
      // FINISH
      // =========================
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateLoanPdf;
