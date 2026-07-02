const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        console.log("\n========== EMAIL SENDING DEBUG ==========");
        console.log("📧 Email Config Check:");
        console.log("   EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ Not Set");
        console.log("   EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Not Set");
        console.log("   Recipient:", to);
        console.log("   Subject:", subject);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("❌ EMAIL_USER or EMAIL_PASS not configured in .env");
            throw new Error("Email credentials not configured");
        }

        console.log("\n🔧 Creating Nodemailer Transporter...");
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS.trim()  // ✅ Trim spaces from password
            }
        });

        // ✅ Verify connection
        console.log("✔️ Testing email connection...");
        await transporter.verify();
        console.log("✅ Email connection verified!");
        
        const mailOptions = {
            from: `Cartify <${process.env.EMAIL_USER}>`,
            to: to.trim(),  // ✅ Trim recipient email
            subject: subject,
            html: text,  // ✅ Send as HTML
            text: text
        };
        
        console.log("\n📬 Sending email with options:");
        console.log("   From:", mailOptions.from);
        console.log("   To:", mailOptions.to);
        console.log("   Subject:", mailOptions.subject);
        console.log("   Content Length:", text.length);
        
        const info = await transporter.sendMail(mailOptions);
        console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
        console.log("   Message ID:", info.messageId);
        console.log("   Response:", info.response);
        console.log("==========================================\n");
        return info;
        
    } catch (error) {
        console.log("\n❌ EMAIL SENDING FAILED!");
        console.log("   Error Code:", error.code);
        console.log("   Error Message:", error.message);
        console.log("   Error Details:", error.response || error);
        console.log("==========================================\n");
        throw error;  // ✅ Throw error so caller knows it failed
    }
}

module.exports = sendEmail;