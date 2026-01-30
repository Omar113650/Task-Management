import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL_ADDRESS,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Task Management" <${process.env.APP_EMAIL_ADDRESS}>`,
      to: to.trim().toLowerCase(),
      subject: subject || "Task Management Notification",
      text: text || "You have a new notification from Task Management",
      html:
        html ||
        `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h3>Task Management</h3>
          <p>You have a new notification.</p>
        </div>
        `,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email error:", error.message);
    throw new Error("Email sending failed");
  }
};



