const nodemailer = require("nodemailer");

console.log("✅ sendEmail.js module loaded");
console.log("   EMAIL_USER configured:", !!process.env.EMAIL_USER);
console.log("   EMAIL_PASS configured:", !!process.env.EMAIL_PASS);

const sendEmail = async (to, subject, text) => {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║     EMAIL SENDING INITIATED             ║");
    console.log("╚════════════════════════════════════════╝");
    
    try {
        if (!to || !subject || !text) {
            console.log("❌ Missing required fields:");
            console.log("   To:", to ? "✅" : "❌");
            console.log("   Subject:", subject ? "✅" : "❌");
            console.log("   Text:", text ? "✅" : "❌");
            return false;
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("❌ EMAIL credentials not configured!");
            console.log("   EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
            console.log("   EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");
            return false;
        }

        console.log("\n📋 Email Details:");
        console.log("   Recipient: " + to);
        console.log("   Subject: " + subject);
        console.log("   Content Length: " + text.length + " chars");
        console.log("   From: " + process.env.EMAIL_USER);

        console.log("\n🔧 Setting up Transporter...");
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log("✅ Transporter created");

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: text,
            text: text
        };

        console.log("📤 Sending via Gmail SMTP...");
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ ✅ ✅ EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅");
        console.log("   Message ID: " + info.messageId);
        console.log("   Response: " + info.response);
        console.log("╔════════════════════════════════════════╗");
        console.log("║     EMAIL SENDING COMPLETE             ║");
        console.log("╚════════════════════════════════════════╝\n");
        return true;

    } catch (error) {
        console.log("\n❌ ❌ ❌ EMAIL SENDING FAILED! ❌ ❌ ❌");
        console.log("   Error Code: " + (error.code || "UNKNOWN"));
        console.log("   Error Message: " + error.message);
        console.log("   Error Details:");
        if (error.response) {
            console.log("      Response: " + error.response);
        }
        if (error.responseCode) {
            console.log("      Response Code: " + error.responseCode);
        }
        console.log("   Stack: " + error.stack);
        console.log("╔════════════════════════════════════════╗");
        console.log("║     EMAIL SENDING FAILED               ║");
        console.log("╚════════════════════════════════════════╝\n");
        return false;
    }
}

module.exports = sendEmail;