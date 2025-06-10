import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await clientPromise).db("bcn_management");
  const collection = db.collection("notifications");

  if (req.method === "GET") {
    // Lấy danh sách thông báo của user (theo inviteeId hoặc inviteeEmail)
    const { userId, email } = req.query;
    const query: any = {};
    if (userId) query.inviteeId = userId;
    if (email) query.inviteeEmail = email;
    const notifications = await collection.find(query).toArray();
    return res.status(200).json({ notifications });
  }

  if (req.method === "POST") {
    const notification = req.body;

    // Chống spam: chỉ cho phép 1 yêu cầu join-request pending cho mỗi user/team
    if (notification.type === "join-request") {
      const existed = await collection.findOne({
        type: "join-request",
        teamId: notification.teamId,
        inviterId: notification.inviterId,
        status: "pending",
      });
      if (existed) {
        return res.status(409).json({
          success: false,
          message: "Bạn đã gửi yêu cầu tham gia nhóm này và đang chờ xác nhận.",
        });
      }
    }

    // Chống spam: chỉ cho phép 1 yêu cầu invite pending cho mỗi user/team
    if (notification.type === "team-invitation") {
      const existed = await collection.findOne({
        type: "team-invitation",
        teamId: notification.teamId,
        inviteeId: notification.inviteeId,
        status: "pending",
      });
      if (existed) {
        return res.status(409).json({
          success: false,
          message: "Đã gửi lời mời trước đó và đang chờ xác nhận.",
        });
      }
    }

    await collection.insertOne(notification);
    return res.status(201).json({ success: true });
  }

  if (req.method === "PUT") {
    const { notificationId, status } = req.body;
    const collection = db.collection("notifications");
    if (
      status === "accepted" ||
      status === "declined" ||
      status === "cancelled" ||
      status === "confirmed"
    ) {
      // Xóa thông báo sau khi xử lý
      await collection.deleteOne({
        notificationId: notificationId,
      });
      return res.status(200).json({ success: true, deleted: true });
    }
    // Nếu chỉ muốn cập nhật trạng thái mà không xóa:
    // await collection.updateOne({ _id: ... }, { $set: { status, updatedAt: new Date() } });
    // return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
