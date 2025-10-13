// src/appwrite.ts
import { Client, Databases, Account, ID,Storage } from "appwrite";

// initialize the client
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // ✅ your endpoint
  .setProject(import.meta.env.VITE_MENTORS_PROJECT_ID as string); // ✅ your project ID from .env

// export the services you’ll use
const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client)
export { client, databases, account, ID,storage };
