const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        console.log("\n========== EMAIL SENDING DEBUG ==========");
        console.log("📧 Recipient:", to);
        console.log("📧 Subject:", subject);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("❌ EMAIL_USER or EMAIL_PASS not configured in .env");
            return false;
        }

        console.log("🔧 Creating Nodemailer Transporter...");
        console.log("   Service: Gmail");
        console.log("   From: " + process.env.EMAIL_USER);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: text
        };
        
        console.log("📤 Sending email...");
        const info = await transporter.sendMail(mailOptions);
        
        console.log("✅ EMAIL SENT SUCCESSFULLY!");
        console.log("   Message ID:", info.messageId);
        console.log("==========================================\n");
        return true;
        
    } catch (error) {
        console.log("\n❌ EMAIL SENDING FAILED!");
        console.log("   Error Code:", error.code);
        console.log("   Error Message:", error.message);
        console.log("==========================================\n");
        return false;
    }
}

module.exports = sendEmail;