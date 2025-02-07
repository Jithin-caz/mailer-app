import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'jithinreji185@gmail.com',
    pass:  'syth jxrf ezgx ucci'
  }
});

// Helper function to add delay between emails
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to send email with retry logic
async function sendEmailWithRetry(mailOptions: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Wait longer between retries (exponential backoff)
      await delay(attempt * 2000); // 2s, 4s, 6s between retries
    }
  }
}

export async function GET(request: Request) {
  try {
    const subject = "MACE MUN Volunteering";
    const excelFilePath = path.join(process.cwd(), 'public', 'sheet.xlsx');

    const excelBuffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(excelBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    const results = [];
    const errors = [];

    // Process emails sequentially instead of in parallel
    for (const row of data) {
      //@ts-ignore
      const volunteerName = row[Object.keys(row)[0]];
       //@ts-ignore
      const email = row[Object.keys(row)[2]];
       //@ts-ignore
      const team = row[Object.keys(row)[3]];

      if (email && typeof email === 'string' && email.includes('@')) {
        const personalizedMessage = `
        Subject:Second test mail for MACE MUN Volunteering.
        
        Dear ${volunteerName},
        
        We are thrilled to have you on board as a volunteer for **MACE MUN**! Your dedication and enthusiasm are what will make this event a success, and we can't wait to work together to create an unforgettable experience.
        
        You have been assigned to the ${team} team. As a member of this team, you will play a key role in ensuring smooth operations, assisting delegates, and upholding the spirit of Model United Nations. This is a great opportunity to learn, network, and contribute to something truly impactful.
        
        
        Stay tuned for more updates, and feel free to reach out if you have any questions. Let's make **MACE MUN** a grand success together!
        
        Looking forward to seeing you in action.
        
        Best regards,  
        Jithin
        MACE MUN Team
        `;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject,
          text: personalizedMessage,
          html: `<p>${personalizedMessage.split('\n').join('<br><br>')}</p>`,
        };

        try {
          // Add delay between emails (1 second)
          await delay(1000);
          
          // Send email with retry logic
          await sendEmailWithRetry(mailOptions);
          results.push(email);
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          errors.push({ email, error: error.message });
        }
      }
    }
    console.log("mail sending done")
    return NextResponse.json(
      { 
        message: 'Email process completed',
        successCount: results.length,
        errorCount: errors.length,
        errors: errors
      },
      { status: 200 }
    );
  } catch (error:any) {
    console.error('Error in email process:', error);
    return NextResponse.json(
      { error: 'Failed to process emails', details: error.message },
      { status: 500 }
    );
  }
}
