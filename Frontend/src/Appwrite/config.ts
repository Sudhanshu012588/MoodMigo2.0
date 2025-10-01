// src/appwrite.ts
import { Client, Databases, Account, ID } from "appwrite";

// initialize the client
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // ✅ your endpoint
  .setProject(import.meta.env.VITE_PROJECT_ID as string); // ✅ your project ID from .env

// export the services you’ll use
const databases = new Databases(client);
const account = new Account(client);

export { client, databases, account, ID };
