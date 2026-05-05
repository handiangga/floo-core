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

              // =========================
              // IMAGE
              // =========================
              if (file.mimetype.startsWith("image/")) {
                try {
                  buffer = await sharp(file.buffer)
                    .resize({ width: 800 })
                    .jpeg({ quality: 70 })
                    .toBuffer();
                } catch (err) {
                  console.log("⚠️ Sharp error, fallback original");
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
                  contentType: file.mimetype,
                });

              if (error) throw error;

              const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

              file.url = data.publicUrl;
            })(),
          );
        }
      }

      // 🔥 RUN PARALLEL (INI KUNCI)
      await Promise.all(uploadTasks);

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
      next(err);
    }
  };
};

module.exports = {
  upload,
  processUpload,
};
