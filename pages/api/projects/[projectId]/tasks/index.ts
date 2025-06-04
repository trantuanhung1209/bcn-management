import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("bcn_management");
      const task = req.body;
      const result = await db
        .collection("projects")
        .updateOne(
          { projectId: projectId as string },
          { $push: { tasks: task } }
        );
      if (result.modifiedCount > 0) {
        res.status(201).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Project not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}