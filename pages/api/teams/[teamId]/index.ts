import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await clientPromise).db("bcn_management");
  const { teamId } = req.query;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ message: "teamId không hợp lệ" });
  }

  if (req.method === "GET") {
    // Lấy thông tin team theo teamId
    const team = await db.collection("teams").findOne({ teamId });
    if (!team) return res.status(404).json({ message: "Không tìm thấy team" });
    return res.status(200).json({ team });
  } else if (req.method === "PUT") {
    // Chỉ cập nhật các trường hợp lệ
    const allowedFields = [
      "teamName",
      "memberQuantity",
      "members",
      "projectId", // thêm projectId vào đây
      "deadline",
      "userId"
    ];
    const updateFields = req.body;
    const filteredUpdate: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in updateFields) filteredUpdate[key] = updateFields[key];
    }
    const result = await db.collection("teams").updateOne(
      { teamId },
      { $set: filteredUpdate }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy team để cập nhật" });
    }
    return res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    // Xóa team
    const result = await db.collection("teams").deleteOne({ teamId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy team để xóa" });
    }
    return res.status(200).json({ success: true });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}