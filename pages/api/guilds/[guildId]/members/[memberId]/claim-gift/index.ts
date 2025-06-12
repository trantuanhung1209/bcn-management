import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../../../lib/mongodb";

function getFameRequired(level: number) {
  return (level - 1) * 100;
}

function getLevelByFame(fame: number, maxLevel = 100) {
  for (let level = maxLevel; level >= 1; level--) {
    if (fame >= getFameRequired(level)) {
      return level;
    }
  }
  return 1;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { guildId, memberId } = req.query;
  if (!guildId || !memberId) {
    return res.status(400).json({ message: "Thiếu guildId hoặc memberId" });
  }
  if (req.method !== "POST") return res.status(405).end();

  const { coin, fame } = req.body;
  const fameNum = Number(fame);
  const coinNum = Number(coin);
  if (isNaN(fameNum) || isNaN(coinNum)) {
    return res.status(400).json({ message: "Fame hoặc coin không hợp lệ" });
  }

  const db = (await clientPromise).db("bcn_management");
  const users = db.collection("users");
  const guilds = db.collection("guilds");

  // Cập nhật coin cho user
  await users.updateOne(
    { userId: memberId },
    { $inc: { coin: coinNum } }
  );

  // Cập nhật fame cho guild
  await guilds.updateOne({ guildId }, { $inc: { fame: fameNum } });

  // Lấy fame mới nhất của guild
  const guild = await guilds.findOne({ guildId });
  const totalFame = guild?.fame || 0;

  // Xác định level mới dựa trên fame của guild
  const newLevel = getLevelByFame(totalFame, 100);

  // Cập nhật level cho guild
  await guilds.updateOne(
    { guildId },
    { $set: { level: newLevel } }
  );

  // Cập nhật coin cho member trong guild (nếu cần)
  await guilds.updateOne(
    { guildId, "members.userId": memberId },
    {
      $inc: {
        "members.$.coin": coinNum,
      }
    }
  );

  return res.status(200).json({ success: true, newLevel });
}
