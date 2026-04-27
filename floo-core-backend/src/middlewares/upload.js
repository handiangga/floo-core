const multer = require("multer");
const sharp = require("sharp");
const { supabase } = require("../config/supabase");

// 🔥 memory storage
const storage = multer.memoryStorage();

// 🔥 filter image only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File harus gambar"), false);
  }
};

const upload = multer({ storage, fileFilter });

// 🔥 PROCESS + UPLOAD (DEFAULT: employees)
const processImage = (bucket = "employees") => {
  return async (req, res, next) => {
    try {
      if (!req.files) return next();

      const dateText = new Date().toLocaleDateString("id-ID");

      const svg = `
        <svg width="500" height="100">
          <text x="10" y="50" font-size="24" fill="white">
            ${dateText}
          </text>
        </svg>
      `;

      for (const field in req.files) {
        const files = req.files[field];

        for (const file of files) {
          const filename =
            Date.now() + "-" + Math.random().toString(9).slice(2) + ".jpg";

          const processedBuffer = await sharp(file.buffer)
            .resize(800)
            .jpeg({ quality: 70 })
            .composite([
              {
                input: Buffer.from(svg),
                gravity: "southeast",
              },
            ])
            .toBuffer();

          // 🔥 upload ke supabase (dynamic bucket)
          const { error } = await supabase.storage
            .from(bucket) // ✅ fleksibel
            .upload(filename, processedBuffer, {
              contentType: "image/jpeg",
            });

          if (error) throw error;

          const { data } = supabase.storage.from(bucket).getPublicUrl(filename);

          // 🔥 inject hasil ke req
          file.filename = filename;
          file.url = data.publicUrl;
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  upload,
  processImage,
};
