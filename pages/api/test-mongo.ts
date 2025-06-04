import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db("bcn_management"); 
    const collections = await db.listCollections().toArray();
    res.status(200).json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}