import { supabase } from "../lib/supabase";

export const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("employees")
    .upload(`employees/${fileName}`, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("employees")
    .getPublicUrl(`employees/${fileName}`);

  return data.publicUrl;
};
