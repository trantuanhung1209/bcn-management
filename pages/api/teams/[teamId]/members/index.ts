import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;
  const client = await clientPromise;
  const db = client.db("bcn_management");

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ message: "teamId không hợp lệ" });
  }

  if (req.method === "GET") {
    const team = await db.collection("teams").findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Không tìm thấy team" });
    }
    // Trả về mảng members, nếu không có thì trả mảng rỗng
    return res.status(200).json({ members: team.members || [] });
  }

  if (req.method === "POST") {
    try {
      const newMember = req.body; // { memberId, memberName, email, role }

      // Lấy team hiện tại
      const team = await db.collection("teams").findOne({ teamId });
      if (!team) {
        return res.status(404).json({ success: false, message: "Không tìm thấy team" });
      }

      // Kiểm tra memberId đã tồn tại chưa
      const existed = (team.members || []).some(
        (m: { memberId: string }) => m.memberId === newMember.memberId
      );
      if (existed) {
        return res.status(400).json({ success: false, message: "Thành viên đã tồn tại trong nhóm" });
      }

      // Thêm member mới vào mảng members
      const result = await db.collection("teams").updateOne(
        { teamId },
        { $push: { members: newMember } }
      );

      if (result.modifiedCount > 0) {
        res.status(201).json({ success: true });
      } else {
        res.status(500).json({ success: false, message: "Không thể thêm thành viên" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}