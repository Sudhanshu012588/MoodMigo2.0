import nodemailer from "nodemailer";
  const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  // host: "smtpout.secureserver.net",
    host: "smtp.ethereal.email",

  // port: 465,
  port:587,
  secure: false, // true for 465, false for other ports
  // auth: {
  //   user: "admin@moodmigo.com",
  //   pass:"Shriya2dhriti",
  // },
  auth: {
      user: testAccount.user,
      pass: testAccount.pass
    },
});
const mailtemplate = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f7f7fc; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #dedede;">
      <h2 style="color:#6C47FF; text-align:center; margin-bottom: 10px;">🎉 Your MoodMigo Session is Confirmed!</h2>

      <p>Hi {{name}},</p>

      <p>Thank you for booking a session with <b>{{mentorName}}</b> on MoodMigo. We're excited to support you on your wellness journey.</p>

      <div style="background: #F3EEFF; border-left: 4px solid #6C47FF; padding: 12px 18px; margin: 20px 0;">
        <p style="margin: 5px 0;"><b>📅 Date:</b> {{date}}</p>
        <p style="margin: 5px 0;"><b>⏰ Time:</b> {{time}} (Your Local Time)</p>
        <p style="margin: 5px 0;"><b>👤 Therapist:</b> {{mentorName}}</p>
        <p style="margin: 5px 0;"><b>💳 Amount Paid:</b> ₹{{amount}}</p>
        <p style="margin: 5px 0;"><b>🧾 Transaction ID:</b> {{transactionId}}</p>
      </div>

      <p>You can join the session at your scheduled time using the link below:</p>

      <p style="text-align:center; margin: 25px 0;">
        <a href="{{link}}" style="background:#6C47FF; color:#fff; text-decoration:none; padding:12px 25px; border-radius:6px; font-weight:bold;">
          Join Video Session
        </a>
      </p>

      <p>If you need to cancel or reschedule your appointment, please reply to this email at least 4 hours before the session.</p>

      <p style="margin-top: 30px;">Looking forward to seeing you soon!</p>

      <p style="font-weight:bold; color:#6C47FF;">– Team MoodMigo 💜</p>

      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />

      <p style="font-size: 12px; color:#555; text-align:center;">
        This is an automated email, please do not reply directly.<br />
        For support, contact us at <a href="mailto:support@moodmigo.com">support@moodmigo.com</a>
      </p>
    </div>
  </body>
</html>
`
export class MailService {
    MailService(clientName,MentorName,subject,link,date,Amount,razorpay_payment_id,sessionUrl,text){
        this.clientName=clientName;
        this.MentorName=MentorName;
        this.subject=subject;
        this.link=link;
        this.date=date;
        this.Amount=Amount;
        this.razorpay_payment_id=razorpay_payment_id;
        this.sessionUrl=sessionUrl;
        this.text=text;
    }
    async SendMail(to){
        const emailHtml = mailtemplate
            .replace("{{name}}", this.clientName)
            .replace("{{mentorName}}", this.MentorName)
            .replace("{{date}}", this.date || "")
            .replace("{{time}}", this.date || "")
            .replace("{{amount}}", this.Amount)
            .replace("{{transactionId}}", this.razorpay_payment_id)
            .replace("{{link}}", this.sessionUrl);
        try{
            const info = await transporter.sendMail({
    from: 'MoodMigo" <admin@moodmigo.com>',
    to: to,
    subject: this.subject,
    text: this.text,
    html: emailHtml, 
  });
    if(!info.accepted){
        throw new Error("Can't send the eamil")
    }
    return info;
        }catch(er){
            console.log(er);
            return;
        }
    }
}