import { account } from "@/lib/appwrite";

export async function logoutUser() {
  return await account.deleteSession("current");
}
