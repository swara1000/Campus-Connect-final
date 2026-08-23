import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "CampusConnect - Password Reset OTP",
    text: `Your CampusConnect password reset OTP is ${otp}. This OTP is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>CampusConnect</h2>
        <p>Your password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};