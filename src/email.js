import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: true,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail({ to, otp, name }) {
  await transporter.sendMail({
    from: `"Node Server" <${process.env.FROM_EMAIL}>`,
    to,
    subject: 'Your OTP Code',
    text: `Hi ${name || 'User'},\n\nYour OTP code is: ${otp}\n\nThis code expires in ${parseInt(process.env.OTP_EXPIRY, 10) || 300} seconds.\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hi ${name || 'User'},</p>
<p>Your OTP code is:</p>
<h1 style="letter-spacing:5px; font-size:32px; background:#f5f5f5; padding:12px 20px; display:inline-block; border-radius:6px;">${otp}</h1>
<p>This code expires in ${parseInt(process.env.OTP_EXPIRY, 10) || 300} seconds.</p>
<p>If you did not request this, please ignore this email.</p>`,
  });
}
