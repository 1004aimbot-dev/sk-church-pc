
import { db } from '@vercel/postgres';

export default async function getClient() {
  const client = await db.connect();
  return client;
}
