import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',

  // Use SSL port
  port: parseInt(process.env.SMTP_PORT, 10) || 465,

  // IMPORTANT for Gmail on Render
  secure: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Prevent timeout issues
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  // Debug logs
  logger: true,
  debug: true,
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP ERROR:', error);
  } else {
    console.log('SMTP SERVER READY');
  }
});

export async function sendOtpEmail({ to, otp, name }) {
  try {
    const info = await transporter.sendMail({
      from: `"Node Server" <${process.env.SMTP_USER}>`,

      to,

      subject: 'Your OTP Code',

      text: `
Hi ${name || 'User'},

Your OTP code is: ${otp}

This code expires in ${
        parseInt(process.env.OTP_EXPIRY, 10) || 300
      } seconds.

If you did not request this, please ignore this email.
      `,

      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <p>Hi ${name || 'User'},</p>

          <p>Your OTP code is:</p>

          <h1 style="
            letter-spacing:5px;
            font-size:32px;
            background:#f5f5f5;
            padding:12px 20px;
            display:inline-block;
            border-radius:6px;
          ">
            ${otp}
          </h1>

          <p>
            This code expires in ${
              parseInt(process.env.OTP_EXPIRY, 10) || 300
            } seconds.
          </p>

          <p>
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log('EMAIL SENT:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('EMAIL SEND ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
}
