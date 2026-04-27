import { supabase } from "../lib/supabase";
import imageCompression from "browser-image-compression";

export const uploadToSupabase = async (
  file,
  {
    bucket = "employees", // ✅ default tetap employees
    onProgress,
    prefix = "file",
  } = {},
) => {
  // 🔥 VALIDASI FILE
  if (!file) throw new Error("File tidak ditemukan");

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }

  // 🔥 COMPRESS
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  });

  // 🔥 FILE NAME RAPI
  const fileName = `${prefix}-${Date.now()}-${compressed.name}`;

  // 🔥 PROGRESS SIMULATION
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress < 90 && onProgress) onProgress(progress);
  }, 150);

  // 🔥 UPLOAD (DINAMIS BUCKET)
  const { error } = await supabase.storage
    .from(bucket) // ✅ DINAMIS
    .upload(fileName, compressed);

  clearInterval(interval);

  if (error) throw error;

  if (onProgress) onProgress(100);

  // 🔥 GET PUBLIC URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return data.publicUrl;
};
