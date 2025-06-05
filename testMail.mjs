import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // hoặc thay trực tiếp email để test
      pass: process.env.GMAIL_PASS, // hoặc thay trực tiếp app password để test
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: "trantuanhung.12092005@gmail.com", // thay bằng email nhận để test
    subject: "Test Nodemailer",
    html: `
      <h2 style="color: #1976d2;">Test gửi mail thành công!</h2>
      <p>Đây là email test gửi từ Nodemailer.</p>
    `,
  });

  console.log("Đã gửi email test thành công!");
}

main().catch(console.error);