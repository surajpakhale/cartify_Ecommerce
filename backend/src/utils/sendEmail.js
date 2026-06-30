const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {  // yaha () aur {} lagao
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };
        
        await transporter.sendMail(mailOptions) 
        console.log("Email sent successfully");
        
    } catch (error) {
        console.log("Email sending error:", error)
    }
}

module.exports = sendEmail;