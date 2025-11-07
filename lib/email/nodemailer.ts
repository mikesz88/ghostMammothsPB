import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface QueueEmailData {
  userName: string;
  userEmail: string;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  currentPosition: number;
  estimatedWaitTime?: number;
  courtNumber?: number;
}

export async function sendQueueJoinEmail(data: QueueEmailData) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.userEmail,
      subject: `Queue Confirmation - ${data.eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎾 Queue Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.userName}</strong>,</p>
              <p>You've successfully joined the queue for <strong>${
                data.eventName
              }</strong>!</p>
              
              <div class="info-box">
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Location:</strong> ${data.eventLocation}</p>
                <p><strong>Date:</strong> ${data.eventDate}</p>
                <p><strong>Your Position:</strong> #${data.currentPosition}</p>
                ${
                  data.estimatedWaitTime
                    ? `<p><strong>Estimated Wait:</strong> ~${data.estimatedWaitTime} minutes</p>`
                    : ""
                }
              </div>
              
              <p>We'll notify you when you're up next!</p>
              <p>See you on the court! 🏓</p>
            </div>
            <div class="footer">
              <p>Ghost Mammoth Pickleball</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.userName},\n\nYou've successfully joined the queue for ${
        data.eventName
      }!\n\nEvent: ${data.eventName}\nLocation: ${data.eventLocation}\nDate: ${
        data.eventDate
      }\nYour Position: #${data.currentPosition}\n${
        data.estimatedWaitTime
          ? `Estimated Wait: ~${data.estimatedWaitTime} minutes\n`
          : ""
      }\nWe'll notify you when you're up next!`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending queue join email:", error);
    return { success: false, error };
  }
}

export async function sendPositionUpdateEmail(data: QueueEmailData) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.userEmail,
      subject: `Queue Update - You've moved up!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📈 You're Getting Closer!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.userName}</strong>,</p>
              <p>Your position in the queue has been updated.</p>
              
              <div class="info-box">
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Current Position:</strong> #${
                  data.currentPosition
                }</p>
                ${
                  data.estimatedWaitTime
                    ? `<p><strong>Estimated Wait:</strong> ~${data.estimatedWaitTime} minutes</p>`
                    : ""
                }
              </div>
              
              <p>Stay nearby - you'll be playing soon!</p>
            </div>
            <div class="footer">
              <p>Ghost Mammoth Pickleball</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${
        data.userName
      },\n\nYour position in the queue has been updated.\n\nEvent: ${
        data.eventName
      }\nCurrent Position: #${data.currentPosition}\n${
        data.estimatedWaitTime
          ? `Estimated Wait: ~${data.estimatedWaitTime} minutes\n`
          : ""
      }\nStay nearby - you'll be playing soon!`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending position update email:", error);
    return { success: false, error };
  }
}

export async function sendUpNextEmail(data: QueueEmailData) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.userEmail,
      subject: `🎾 You're Up Next! - ${data.eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .alert { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎾 You're Up Next!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.userName}</strong>,</p>
              
              <div class="alert">
                ⚠️ GET READY! You're one of the next players to be assigned to a court.
              </div>
              
              <div class="info-box">
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Location:</strong> ${data.eventLocation}</p>
                <p><strong>Your Position:</strong> #${data.currentPosition}</p>
              </div>
              
              <p><strong>Please make sure you're at the venue and ready to play!</strong></p>
              <p>You'll receive another notification when you're assigned to a court.</p>
            </div>
            <div class="footer">
              <p>Ghost Mammoth Pickleball</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.userName},\n\n🎾 YOU'RE UP NEXT!\n\nGet ready! You're one of the next players to be assigned to a court.\n\nEvent: ${data.eventName}\nLocation: ${data.eventLocation}\nYour Position: #${data.currentPosition}\n\nPlease make sure you're at the venue and ready to play!`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending up next email:", error);
    return { success: false, error };
  }
}

export async function sendCourtAssignmentEmail(data: QueueEmailData) {
  if (!data.courtNumber) {
    return { success: false, error: "Court number is required" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.userEmail,
      subject: `🎾 Time to Play! Court ${data.courtNumber} - ${data.eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .court-number { font-size: 48px; color: #16a34a; text-align: center; margin: 30px 0; font-weight: bold; }
            .info-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .alert { background: #16a34a; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎾 It's Your Turn to Play!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${data.userName}</strong>,</p>
              
              <div class="alert">
                🎉 YOU'VE BEEN ASSIGNED TO A COURT!
              </div>
              
              <div class="court-number">
                Court #${data.courtNumber}
              </div>
              
              <div class="info-box">
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Location:</strong> ${data.eventLocation}</p>
              </div>
              
              <p style="text-align: center; font-size: 18px;"><strong>Please head to Court #${data.courtNumber} now!</strong></p>
              <p style="text-align: center;">Have a great game! 🏓</p>
            </div>
            <div class="footer">
              <p>Ghost Mammoth Pickleball</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.userName},\n\n🎾 IT'S YOUR TURN TO PLAY!\n\nYou've been assigned to Court #${data.courtNumber}\n\nEvent: ${data.eventName}\nLocation: ${data.eventLocation}\n\nPlease head to Court #${data.courtNumber} now!\n\nHave a great game! 🏓`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending court assignment email:", error);
    return { success: false, error };
  }
}
