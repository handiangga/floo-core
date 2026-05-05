const multer = require("multer");
const sharp = require("sharp");
const { supabase } = require("../config/supabase");

// 🔥 memory storage
const storage = multer.memoryStorage();

// 🔥 allow image + pdf
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File harus image atau PDF"), false);
  }
};

const upload = multer({ storage, fileFilter });

// 🔥 PROCESS + UPLOAD
const processUpload = (bucket = "employees") => {
  return async (req, res, next) => {
    try {
      if (!req.files) return next();

      const uploadTasks = [];

      for (const field in req.files) {
        const files = req.files[field];

        for (const file of files) {
          uploadTasks.push(
            (async () => {
              let buffer = file.buffer;
              let fileName;
              let contentType = file.mimetype;

              // =========================
              // IMAGE
              // =========================
              if (file.mimetype.startsWith("image/")) {
                try {
                  buffer = await sharp(file.buffer)
                    .resize({ width: 800 })
                    .jpeg({ quality: 70 })
                    .toBuffer();

                  contentType = "image/jpeg"; // 🔥 FIX
                } catch (err) {
                  console.log("⚠️ Sharp error:", err.message);
                }

                fileName = `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}.jpg`;
              }

              // =========================
              // PDF
              // =========================
              else if (file.mimetype === "application/pdf") {
                fileName = `${Date.now()}-${file.originalname}`;
              }

              // =========================
              // UPLOAD
              // =========================
              const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, buffer, {
                  contentType,
                  upsert: true, // 🔥 avoid conflict
                });

              if (error) {
                console.error("❌ Upload error:", error.message);
                throw error;
              }

              const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

              file.url = data.publicUrl;
            })(),
          );
        }
      }

      // 🔥 SAFETY TIMEOUT (ANTI HANG)
      const result = await Promise.race([
        Promise.all(uploadTasks),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Upload timeout")), 15000),
        ),
      ]);

      // =========================
      // INJECT BODY
      // =========================
      req.body = req.body || {};

      if (req.files?.photo?.[0]?.url) {
        req.body.photo = req.files.photo[0].url;
      }

      if (req.files?.ktp_photo?.[0]?.url) {
        req.body.ktp_photo = req.files.ktp_photo[0].url;
      }

      if (req.files?.proof?.[0]?.url) {
        req.body.proof = req.files.proof[0].url;
      }

      if (req.files?.signed_contract?.[0]?.url) {
        req.body.signed_contract = req.files.signed_contract[0].url;
      }

      next();
    } catch (err) {
      console.error("🔥 PROCESS UPLOAD ERROR:", err);
      next(err);
    }
  };
};

module.exports = {
  upload,
  processUpload,
};
