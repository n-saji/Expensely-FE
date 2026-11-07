import { profileUrlFromPath } from "./profileUrl";

export default async function fetchProfileUrl(filePath: string): Promise<string> {
  return profileUrlFromPath(filePath);
}
