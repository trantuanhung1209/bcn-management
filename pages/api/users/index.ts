import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await clientPromise).db("bcn_management");

  if (req.method === "GET") {
    const { status, role } = req.query;
    const filter: Record<string, string> = {};
    if (status) filter.status = status as string;
    if (role) filter.role = role as string;
    const users = await db.collection("users").find(filter).toArray();
    res.status(200).json({ users });
  } else if (req.method === "POST") {
    // Đăng ký user mới
    const user = req.body;
    // Kiểm tra email hoặc tên đăng nhập đã tồn tại chưa
    const existed = await db.collection("users").findOne({
      $or: [{ email: user.email }, { userName: user.userName }],
    });
    if (existed) {
      let message = "Email đã tồn tại";
      if (existed.userName === user.userName)
        message = "Tên đăng nhập đã tồn tại";
      return res.status(409).json({ success: false, message });
    }
    await db.collection("users").insertOne(user);
    res.status(201).json({ success: true });
  } else if (req.method === "PUT") {
    // Cập nhật thông tin user (theo userId)
    const { userId, status, isActive } = req.body;
    await db.collection("users").updateOne({ userId }, { $set: { status, isActive } });
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    // Xóa user
    const { userId } = req.body;
    await db.collection("users").deleteOne({ userId });
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
