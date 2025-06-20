const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

class EmailNotification {
  constructor() {
    this.transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // ... phần code còn lại của bạn

    // Ensure lastSentTime is always a Map to support .set() and .delete()
    this.lastSentTime = new Map();
    this.minInterval = 60000; // 1 minute between emails
  }

  // Kiểm tra rate limiting cho email
  canSendEmail(email) {
    const now = Date.now();
    const lastSent = this.lastSentTime.get(email) || 0;

    if (now - lastSent < this.minInterval) {
      return false;
    }

    this.lastSentTime.set(email, now);
    return true;
  }

  async sendForgotPasswordEmail(email, code) {
    try {
      // Kiểm tra rate limiting
      if (!this.canSendEmail(email)) {
        throw new Error("Please wait before requesting another reset code");
      }

      const letter = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password Reset Code - Booking System",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                  You have requested to reset your password. Please use the code below:
                </p>
                
                <div style="background-color: #007bff; color: white; padding: 15px 30px; border-radius: 5px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                  ${code}
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  This code will expire in <strong>10 minutes</strong>.
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  If you didn't request this password reset, please ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px;">
                  Best regards,<br>
                  The Booking Team
                </p>
              </div>
            </div>
          `,
        text: `
  Your password reset code is: ${code}
  
  This code will expire in 10 minutes.
  
  If you didn't request this password reset, please ignore this email.
  
  Best regards,
    TechXchange 
        `,
      };

      const result = await this.transporter.sendMail(letter);
      console.log("Password reset email sent successfully:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Failed to send password reset email:", error);

      // Reset rate limiting nếu gửi email thất bại
      this.lastSentTime.delete(email);

      throw new Error("Failed to send reset email. Please try again later.");
    }
  }
}
module.exports = EmailNotification;
