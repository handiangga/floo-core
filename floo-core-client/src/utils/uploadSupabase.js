import { supabase } from "../lib/supabase";
import imageCompression from "browser-image-compression";

export const uploadToSupabase = async (file, onProgress) => {
  // 🔥 compress
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  });

  const fileName = `${Date.now()}-${compressed.name}`;

  // 🔥 fake progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progress < 90 && onProgress) onProgress(progress);
  }, 150);

  // ✅ FIX: JANGAN pakai employees/
  const { error } = await supabase.storage
    .from("employees")
    .upload(fileName, compressed); // 🔥 INI FIX

  clearInterval(interval);

  if (error) throw error;

  if (onProgress) onProgress(100);

  const { data } = supabase.storage.from("employees").getPublicUrl(fileName); // 🔥 INI FIX JUGA

  return data.publicUrl;
};
