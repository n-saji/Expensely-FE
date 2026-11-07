const profileOrigin = "https://expensely-profiles-993371733162.s3.us-east-2.amazonaws.com/";
const legacyOrigins = [
  "https://expensely-profiles.s3.amazonaws.com/",
  "https://expensely-profiles.s3.us-east-2.amazonaws.com/",
];

export function normalizeProfileUrl(value: string): string {
  for (const origin of legacyOrigins) {
    if (value.startsWith(origin)) return profileOrigin + value.slice(origin.length);
  }
  return value;
}

export function profileUrlFromPath(value: string): string {
  if (!value) return "";
  if (value.startsWith("https://") || value.startsWith("http://")) return normalizeProfileUrl(value);
  return profileOrigin + value;
}
