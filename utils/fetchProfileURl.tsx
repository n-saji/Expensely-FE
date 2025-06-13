import { supabase } from "@/utils/supabase";
export default async function fetchProfileUrl(
  filePath: string
): Promise<string> {
  console.log("Fetching profile picture URL for file path:", filePath);
  const { data, error: signedUrlError } = await supabase.storage
    .from("profiles-expensely")
    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 1 week expiration

  if (signedUrlError) {
    console.error("Signed URL Error:", signedUrlError.message);
    return "";
  }

  const signedUrl = data?.signedUrl;
  console.log("Uploaded image Signed URL:", signedUrl);
  if (!signedUrl) {
    throw new Error("Failed to fetch signed URL for profile picture");
  }
  return signedUrl;
}
