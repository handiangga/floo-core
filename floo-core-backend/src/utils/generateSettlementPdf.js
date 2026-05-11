const PDFDocument = require("pdfkit");
const { supabase } = require("../config/supabase");

// =========================
// FORMAT RUPIAH
// =========================
const rupiah = (value = 0) => {
  return Number(value).toLocaleString("id-ID");
};

const generateSettlementPdf = async (loan, employee) => {
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

          const fileName = `settlement-${loan.id}-${Date.now()}.pdf`;

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
      doc.font("Helvetica-Bold").fontSize(16).text("SURAT PELUNASAN PINJAMAN", {
        align: "center",
      });

      doc.moveDown(2);

      // =====================================================
      // NOMOR
      // =====================================================
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Nomor : SPL-${loan?.id || "-"}/FF/2026`, {
          align: "center",
        });

      doc.moveDown(2);

      // =====================================================
      // CONTENT
      // =====================================================
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          "Dengan ini perusahaan menerangkan bahwa pinjaman karyawan berikut telah dinyatakan LUNAS.",
          {
            align: "justify",
          },
        );

      doc.moveDown(2);

      // =====================================================
      // DETAIL
      // =====================================================
      doc.text("Nama Karyawan", 50);
      doc.text(`: ${employee?.name || "-"}`, 200, doc.y - 15);

      doc.text("Jabatan", 50);
      doc.text(`: ${employee?.position || "-"}`, 200, doc.y - 15);

      doc.text("Total Pinjaman", 50);
      doc.text(`: Rp ${rupiah(loan?.total_amount)}`, 200, doc.y - 15);

      doc.text("Total Pembayaran", 50);
      doc.text(`: Rp ${rupiah(loan?.total_amount)}`, 200, doc.y - 15);

      doc.text("Status", 50);
      doc.text(": LUNAS", 200, doc.y - 15);

      doc.text("Tanggal Pelunasan", 50);

      doc.text(`: ${new Date().toLocaleDateString("id-ID")}`, 200, doc.y - 15);

      doc.moveDown(2);

      // =====================================================
      // PARAGRAF
      // =====================================================
      doc.text(
        "Dengan diterbitkannya surat ini, maka PIHAK KEDUA dinyatakan telah menyelesaikan seluruh kewajiban pembayaran pinjaman kepada FLOO FASHIONN dan tidak memiliki sisa tanggungan pinjaman.",
        {
          align: "justify",
        },
      );

      doc.moveDown(4);

      // =====================================================
      // TTD
      // =====================================================
      doc.text(`Yogyakarta, ${new Date().toLocaleDateString("id-ID")}`, {
        align: "right",
      });

      doc.moveDown(3);

      doc.text("FLOO FASHIONN", {
        align: "right",
      });

      doc.moveDown(5);

      doc.font("Helvetica-Bold").text("( Abidin Angga )", {
        align: "right",
      });

      doc.font("Helvetica");

      doc.text("Manager", {
        align: "right",
      });

      // =====================================================
      // FOOTER
      // =====================================================
      doc.moveDown(3);

      doc
        .fontSize(9)
        .fillColor("gray")
        .text("Dokumen ini dibuat secara otomatis oleh sistem FLOO FASHIONN.", {
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

module.exports = generateSettlementPdf;
