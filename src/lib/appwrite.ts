import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID, 
  collections: {
    products: import.meta.env.VITE_APPWRITE_PRODUCTS_ID,
    orders: import.meta.env.VITE_APPWRITE_ORDERS_ID,
    orderItems: import.meta.env.VITE_APPWRITE_ORDERITEMS_ID,
    profiles: import.meta.env.VITE_APPWRITE_PROFILES_ID,
    userRoles: import.meta.env.VITE_APPWRITE_USERROLES_ID,
  },
  buckets: {
    productImages: import.meta.env.VITE_APPWRITE_PRODUCTIMAGES_ID,
  }
};