import { supabase } from "@/utils/supabase";
export default async function fetchProfileUrl(
  filePath: string
): Promise<string> {
  const { data, error: signedUrlError } = await supabase.storage
    .from("profiles-expensely")
    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 1 week expiration

  if (signedUrlError) {
    console.error("Signed URL Error:", signedUrlError.message);
    return "";
  }

  const signedUrl = data?.signedUrl;
  if (!signedUrl) {
    throw new Error("Failed to fetch signed URL for profile picture");
  }
  return signedUrl;
}
