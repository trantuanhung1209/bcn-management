import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId, memberId } = req.query;
  const client = await clientPromise;
  const db = client.db("bcn_management");

  if (!teamId || !memberId || typeof teamId !== "string" || typeof memberId !== "string") {
    return res.status(400).json({ message: "teamId hoặc memberId không hợp lệ" });
  }

  if (req.method === "DELETE") {
    try {
      const result = await db.collection("teams").updateOne(
        { teamId },
        { $pull: { members: { memberId: memberId as string } } } as any
      );
      if (result.modifiedCount > 0) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ success: false, message: "Không tìm thấy thành viên hoặc team" });
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}