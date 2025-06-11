import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { userId },
    method,
  } = req;

  const db = (await clientPromise).db("bcn_management");
  const collection = db.collection("users");

  if (method === "GET") {
    const user = await collection.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    return res.status(200).json(user);
  }

  return res.status(405).json({ message: "Method not allowed" });
}