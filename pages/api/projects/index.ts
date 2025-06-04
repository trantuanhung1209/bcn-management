import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db("bcn_management");

  if (req.method === "GET") {
    // Lấy danh sách project
    const projects = await db.collection("projects").find({}).toArray();
    res.status(200).json({ success: true, projects });
  } else if (req.method === "POST") {
    // Tạo mới project
    const project = req.body;
    const result = await db.collection("projects").insertOne(project);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}