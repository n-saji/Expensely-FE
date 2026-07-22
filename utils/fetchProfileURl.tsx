export default async function fetchProfileUrl(
  filePath: string
): Promise<string> {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `https://expensely-profiles.s3.us-east-2.amazonaws.com/${filePath}`;
}
