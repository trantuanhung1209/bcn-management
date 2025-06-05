import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { fullName, email, userName, password } = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Tài khoản của bạn đã được phê duyệt",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #2c3e50; text-align: center;">🎉 Tài khoản của bạn đã được phê duyệt!</h2>
      <p>Chào <strong>${fullName}</strong>,</p>
      <p>Chúc mừng! Tài khoản của bạn đã được phê duyệt. Dưới đây là thông tin đăng nhập của bạn:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background-color: #f0f0f0; font-weight: bold;">Tên đăng nhập:</td>
          <td style="padding: 10px;">${userName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f0f0f0; font-weight: bold;">Mật khẩu:</td>
          <td style="padding: 10px;">${password}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Vui lòng đăng nhập tại website để bắt đầu sử dụng tài khoản của bạn.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://bcn-management.vercel.app" style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">Đăng nhập ngay</a>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #888;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
    </div>
  `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      console.log("Email content:", fullName, userName, password, email);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Send mail error:", error);
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false });
  }
}
