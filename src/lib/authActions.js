import { account, ID } from "@/lib/appwrite";

export async function signUpWithEmail(email, password, name) {
  await account.create(ID.unique(), email, password, name);
  return account.createEmailSession(email, password);
}

export async function loginWithEmail(email, password) {
  return account.createEmailSession(email, password);
}

export async function logoutUser() {
  return account.deleteSession("current");
}
