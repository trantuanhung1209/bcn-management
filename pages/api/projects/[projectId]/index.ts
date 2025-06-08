import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  const client = await clientPromise;
  const db = client.db("bcn_management");

  if (req.method === "GET") {
    // Lấy chi tiết project
    const project = await db
      .collection("projects")
      .findOne({ projectId: projectId as string });
    if (project) {
      res.status(200).json({ success: true, project });
    } else {
      res.status(404).json({ success: false, message: "Project not found" });
    }
  } else if (req.method === "PUT") {
    const updateData = req.body;
    if ("_id" in updateData) {
      delete updateData._id;
    }
    // Chỉ lấy các trường hợp lệ
    const allowedFields = [
      "projectStatus",
      "teamId",
      "projectName",
      "deadline",
      "description",
    ];
    const filteredUpdate: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in updateData) filteredUpdate[key] = updateData[key];
    }
    const result = await db
      .collection("projects")
      .updateOne({ projectId: projectId as string }, { $set: filteredUpdate });
    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Project not found or not updated" });
    }
  } else if (req.method === "DELETE") {
    // Xoá project
    const result = await db
      .collection("projects")
      .deleteOne({ projectId: projectId as string });
    if (result.deletedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Project not found" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
