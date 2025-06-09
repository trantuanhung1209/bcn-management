import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await clientPromise).db("bcn_management");
  const collection = db.collection("invitations");

  if (req.method === "GET") {
    // Lấy danh sách lời mời của user (theo inviteeId hoặc inviteeEmail)
    const { userId, email } = req.query;
    const query: any = { status: "pending" };
    if (userId) query.inviteeId = userId;
    if (email) query.inviteeEmail = email;
    const invitations = await collection.find(query).toArray();
    return res.status(200).json({ invitations });
  }

  if (req.method === "POST") {
    // Tạo mới lời mời
    const invitation = req.body;
    await collection.insertOne(invitation);
    return res.status(201).json({ success: true });
  }

  if (req.method === "PUT") {
    const { invitationId, status } = req.body;
    const collection = db.collection("invitations");
    if (status === "accepted" || status === "declined") {
      // Xóa invitation sau khi xử lý
      await collection.deleteOne({
        invitationId: invitationId
      });
      return res.status(200).json({ success: true, deleted: true });
    }
    // Nếu chỉ muốn cập nhật trạng thái mà không xóa:
    // await collection.updateOne({ _id: ... }, { $set: { status, updatedAt: new Date() } });
    // return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
