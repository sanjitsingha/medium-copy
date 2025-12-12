import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  OAuthProvider,
} from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // OR your self-hosted endpoint
  .setProject("693849cd0038923894fb");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, OAuthProvider };
