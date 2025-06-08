import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db("bcn_management");

  if (req.method === "GET") {
    const { userId } = req.query;

    let teams;
    if (userId && typeof userId === "string") {
      // Lấy các team mà user là thành viên
      teams = await db.collection("teams").find({
        members: { $elemMatch: { memberId: userId } }
      }).toArray();
    } else {
      // Lấy tất cả team
      teams = await db.collection("teams").find({}).toArray();
    }

    return res.status(200).json({ teams });
  } else if (req.method === "POST") {
    // Tạo mới nhóm, kiểm tra tên nhóm đã tồn tại chưa
    const team = req.body;
    const existed = await db.collection("teams").findOne({ teamName: team.teamName });
    if (existed) {
      return res.status(409).json({ success: false, message: "Tên nhóm đã tồn tại" });
    }
    const result = await db.collection("teams").insertOne(team);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
