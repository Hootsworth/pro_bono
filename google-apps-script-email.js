// Pro Bono Admin Email Notification Script
// Deploy this as a Google Apps Script Web App

// ==============================================
// SETUP INSTRUCTIONS:
// ==============================================
// 1. Go to https://script.google.com/
// 2. Create a new project named "Pro Bono Admin Emails"
// 3. Paste this entire code
// 4. Deploy > New Deployment > Web App
//    - Execute as: Me (your account)
//    - Who has access: Anyone
// 5. Copy the Web App URL
// 
// Add to admin.js approveApplication and rejectApplication functions:
// - Call: await sendNotificationEmail(email, major, password, 'approved')
// - Call: await sendNotificationEmail(email, null, null, 'rejected')
// ==============================================

// Your email (from address)
const SENDER_NAME = "Pro Bono Admin";

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if (data.type === 'approved') {
            return sendApprovalEmail(data.email, data.major, data.password);
        } else if (data.type === 'rejected') {
            return sendRejectionEmail(data.email);
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid type'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function sendApprovalEmail(email, major, password) {
    const subject = "🎉 Welcome to Pro Bono - Admin Access Approved!";

    const body = `
Hello!

Great news! Your application to become an Admin Lite on Pro Bono has been APPROVED! 🎉

Here are your login credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${email}
🔐 Password: ${password}
🎓 Assigned Major: ${major}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What you can do:
• Create and edit courses within your assigned major (${major})
• Add YouTube video lectures
• Upload Google Drive links for question papers
• Add problem sets and practice materials

Important reminders:
• You are responsible for all content you upload
• Keep content educational and appropriate
• Misuse will result in access removal

Login here: [Your Pro Bono URL]/admin.html

Thank you for helping grow Pro Bono! 💙

Best regards,
Pro Bono Team
`;

    const htmlBody = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #FFD93D; border: 3px solid #1A1A1A; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to Pro Bono!</h1>
  </div>
  
  <div style="border: 3px solid #1A1A1A; border-top: none; padding: 30px; background: white;">
    <p style="font-size: 16px;">Hello!</p>
    
    <p>Great news! Your application to become an <strong>Admin Lite</strong> on Pro Bono has been <span style="color: green; font-weight: bold;">APPROVED!</span> 🎉</p>
    
    <div style="background: #f5f5f5; border: 2px solid #1A1A1A; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Your Login Credentials</h3>
      <p><strong>📧 Email:</strong> ${email}</p>
      <p><strong>🔐 Password:</strong> <code style="background: #FFD93D; padding: 4px 8px;">${password}</code></p>
      <p><strong>🎓 Assigned Major:</strong> ${major}</p>
    </div>
    
    <h3>What you can do:</h3>
    <ul>
      <li>Create and edit courses within <strong>${major}</strong></li>
      <li>Add YouTube video lectures</li>
      <li>Upload Google Drive links for question papers</li>
      <li>Add problem sets and practice materials</li>
    </ul>
    
    <div style="background: #FFE4E4; border: 2px solid #FF6B6B; padding: 15px; margin: 20px 0;">
      <h4 style="margin-top: 0; color: #FF6B6B;">⚠️ Important Reminders</h4>
      <ul style="margin-bottom: 0;">
        <li>You are responsible for all content you upload</li>
        <li>Keep content educational and appropriate</li>
        <li>Misuse will result in access removal</li>
      </ul>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      Thank you for helping grow Pro Bono! 💙
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
    <p>Pro Bono Team</p>
  </div>
</div>
`;

    try {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            body: body,
            htmlBody: htmlBody,
            name: SENDER_NAME
        });

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Approval email sent'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function sendRejectionEmail(email) {
    const subject = "Pro Bono Admin Application Update";

    const body = `
Hello,

Thank you for your interest in becoming an Admin Lite on Pro Bono.

Unfortunately, we are unable to approve your application at this time.

This could be due to:
• We currently have enough admins for your preferred major
• Your application didn't match our current needs
• We need more information from you

You're welcome to apply again in the future or reach out to us for more information.

Thank you for your understanding!

Best regards,
Pro Bono Team
`;

    const htmlBody = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; border: 3px solid #1A1A1A; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Pro Bono Application Update</h1>
  </div>
  
  <div style="border: 3px solid #1A1A1A; border-top: none; padding: 30px; background: white;">
    <p style="font-size: 16px;">Hello,</p>
    
    <p>Thank you for your interest in becoming an <strong>Admin Lite</strong> on Pro Bono.</p>
    
    <p>Unfortunately, we are unable to approve your application at this time.</p>
    
    <div style="background: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-style: italic;">This could be due to limited spots, timing, or needing more information. You're welcome to apply again in the future!</p>
    </div>
    
    <p>Thank you for your understanding.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>Pro Bono Team</strong>
    </p>
  </div>
</div>
`;

    try {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            body: body,
            htmlBody: htmlBody,
            name: SENDER_NAME
        });

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Rejection email sent'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Test function (run this to test emails)
function testApprovalEmail() {
    sendApprovalEmail('test@example.com', 'Computer Science', 'TestPass123');
}

function testRejectionEmail() {
    sendRejectionEmail('test@example.com');
}
