const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        console.log("📧 Email sending attempt:");
        console.log("   To:", to);
        console.log("   Subject:", subject);
        console.log("   From:", process.env.EMAIL_USER);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("❌ EMAIL_USER or EMAIL_PASS not configured");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: `Cartify <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: text,  // ✅ Changed to html for better formatting
            text: text
        };
        
        console.log("📨 Sending mail options:", {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.messageId);
        return info;
        
    } catch (error) {
        console.log("❌ Email sending error:", error.message);
        console.log("Error details:", error);
    }
}

module.exports = sendEmail;