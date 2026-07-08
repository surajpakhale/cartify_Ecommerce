const nodemailer = require("nodemailer");

console.log("✅ sendEmail.js module loaded");
console.log("   EMAIL_USER configured:", !!process.env.EMAIL_USER);
console.log("   EMAIL_PASS configured:", !!process.env.EMAIL_PASS);

const sendEmail = async (to, subject, text, attachments = []) => {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║     EMAIL SENDING INITIATED             ║");
    console.log("╚════════════════════════════════════════╝");
    
    try {
        if (!to || !subject || !text) {
            console.log("❌ Missing required fields (to, subject, or text).");
            return false;
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("❌ Email service credentials (EMAIL_USER, EMAIL_PASS) not configured.");
            return false;
        }

        console.log("\n📋 Email Details:");
        console.log(`   Recipient: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   From: ${process.env.EMAIL_USER}`);
        console.log(`   Attachments: ${attachments.length > 0 ? `${attachments.length} attached` : 'None'}`);

        console.log("\n🔧 Setting up Transporter (Gmail)...");
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("✅ Transporter created.");

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Cartify'}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: text,
            attachments: attachments
        };

        console.log("📤 Sending email via SMTP...");
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ ✅ ✅ EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅");
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   SMTP Response: ${info.response}`);
        console.log("╚════════════════════════════════════════╝\n");
        return true;

    } catch (error) {
        console.log("\n❌ ❌ ❌ EMAIL SENDING FAILED! ❌ ❌ ❌");
        console.log(`   Error Code: ${error.code || 'N/A'}`);
        console.log(`   Error Message: ${error.message}`);
        if (error.response) console.log(`   SMTP Response: ${error.response}`);
        console.log("╚════════════════════════════════════════╝\n");
        // Optional: log stack trace for deeper debugging, but can be verbose
        // console.log("Stack:", error.stack); 
        return false;
    }
}

module.exports = sendEmail;