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

      for (const field in req.files) {
        const files = req.files[field];

        for (const file of files) {
          let buffer = file.buffer;
          let fileName;

          // =========================
          // 🔥 HANDLE IMAGE
          // =========================
          if (file.mimetype.startsWith("image/")) {
            const svg = `
              <svg width="500" height="100">
                <text x="10" y="50" font-size="24" fill="white">
                  ${new Date().toLocaleDateString("id-ID")}
                </text>
              </svg>
            `;

            buffer = await sharp(file.buffer)
              .resize(800)
              .jpeg({ quality: 70 })
              .composite([
                {
                  input: Buffer.from(svg),
                  gravity: "southeast",
                },
              ])
              .toBuffer();

            fileName = `${Date.now()}-${Math.random()
              .toString(9)
              .slice(2)}.jpg`;
          }

          // =========================
          // 🔥 HANDLE PDF (NO PROCESS)
          // =========================
          else if (file.mimetype === "application/pdf") {
            fileName = `${Date.now()}-${file.originalname}`;
          }

          // =========================
          // 🔥 UPLOAD KE SUPABASE
          // =========================
          const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, {
              contentType: file.mimetype,
            });

          if (error) throw error;

          const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

          file.url = data.publicUrl;
        }
      }

      // =========================
      // 🔥 INJECT PER FIELD (FIX)
      // =========================
      if (!req.body) req.body = {};

      if (req.files?.proof?.[0]?.url) {
        req.body.proof = req.files.proof[0].url;
      }

      if (req.files?.signed_contract?.[0]?.url) {
        req.body.signed_contract = req.files.signed_contract[0].url;
      }

      if (req.files?.photo?.[0]?.url) {
        req.body.photo = req.files.photo[0].url;
      }

      if (req.files?.ktp_photo?.[0]?.url) {
        req.body.ktp_photo = req.files.ktp_photo[0].url;
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
