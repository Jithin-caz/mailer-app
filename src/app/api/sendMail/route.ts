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
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
interface TemplateParams {
  committeeName: string;
  accountName: string;
  upiId: string;
  accountNumber: string;
  ifscCode: string;
}
// Helper function to add delay between emails
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to send email with retry logic
async function sendEmailWithRetry(mailOptions:unknown, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      //@ts-ignore
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(attempt * 2000);
    }
  }
}
const emailTemplate2 = ({
  delegateName,portfolio
}:{delegateName:string,portfolio:string} ) =>`<div style=" font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; color: #333; padding: 20px; max-width: 800px; margin: auto; border-radius: 10px; ">
       <div style="display: flex; align-items: center; width: 100%;justify-content:space-between; ">
        <h1 style="color: #b55e06; text-align: center; font-size:35px; ">MACE MUN’25</h1> 
        <img src="https://i.pinimg.com/736x/fe/a7/1b/fea71bf667fe4ae819524772f6019cf5.jpg" style="width:50%;" alt="no image">
       </div>
       
        <h3 style="color: #b55e06; background:#f8e0a0; padding: 10px; text-align: center; border-radius: 5px;">SOCHUM- Social, Humanitarian, and Cultural Committee(Online)</h3>
        
        <p>Greetings <strong>${delegateName}</strong>!</p>
        
        <p>Thank you for applying to MACE MUN’25.</p>
        
        <p>We are pleased to inform you that you have been allotted in the second round of Delegate Applications of MACE MUN’25, scheduled to be held from <strong>14th to 16th March 2025</strong>, at <strong>Mar Athanasius College of Engineering, Kothamangalam, Kerala</strong>.</p>
        
        <p >Kindly find your allotment:</p>
        <h2 style="text-align: center;color: #b55e06; "><strong>Portfolio:</strong> ${portfolio}</h2>
        
        
        <h3 style="text-align: center;color: #b55e06; ">Fee Structure:</h3>
        <p style="text-align: center;">
          <b>Online Committee: 299/-</b>  
        </p>
        <p style="text-align: center;">
            Please find below the details for making the payment: <br> <br>
            <div style="display: grid; flex-direction: column">
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">Name: Sarah Treesa Jose</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">UPI:sarahtj1621@okaxis</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">Account Number: 13070100179231</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">IFSC:  FDR0001307</p>
            </div>
        </p>
        
        <p>As you may be aware, the registration fee covers the costs of organizing the event, including venue rental, food for 3 days and a delegate kit. It also helps us in providing an enriching experience to all the attendees. Therefore, we highly value your contribution and participation in this event</p>
        
        <p>We request you to confirm your portfolio by paying the delegate's fees on or before 2nd March 5:00 PM to expedite the process of allocation. 
            Kindly fill out this form and confirm your portfolio.
            </p>
        
        <p style="text-align: center;"><a href="https://bit.ly/Portfolioconfirmation" target="_blank" style="color: #0044cc; text-decoration: none;"><b>https://bit.ly/Portfolioconfirmation</b> </a></p>
        
        <p>You are eligible to apply for a re-allotment if you are unsatisfied with the present one after paying the delegates' fee.</p>
        
        <p>Kindly please note that we follow a <b>zero refund</b> policy, but we facilitate replacements.</p>
        
        <p>Thank you for your cooperation and support. We look forward to your participation and a great munn-ing experience.</p>
        <p>For any queries, please feel free to contact the undersigned.</p>
        <p>Thank you.</p>
         <br>
         <p style="color: #ca8d4f;"><i>Regards,</i></p><b></b>
         <p style="color: #ca8d4f;"><i>Secretariat,<br>
            MACE MUN‘25
            </i></p>
         <br>
            <hr style="width:90%; height: .8px; background-color: #000000; border: none;">
            <br>
            <div class="payment" style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; justify-content: center; align-items: center; width: 100%; text-align: center;">
                <div style="text-align: center;  overflow-wrap: break-word;">
                    <i>Ann Martin <br> +91 6235867437 <br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
                <div style="text-align: center;  overflow-wrap: break-word;">
                    <i>Jithin Reji <br> +91 9188810189 <br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
                <div style="text-align: center; overflow-wrap: break-word;">
                    <i>Sarah Treesa Jose <br>+91 8078330295<br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
            </div>              
        <p style="text-align: center;"><a href="https://macemun.in" target="_blank" style="color:#ca8d4f;  text-decoration: none;">macemun.in</a></p>
       <p style="text-align: center;"><a href="https://www.instagram.com/macemun_25/" target="_blank" style="color:#ca8d4f;  text-decoration: none;">instagram</a></p>
    </div>`;

const emailTemplate = ({
  committeeName,
  accountName,
  upiId,
  accountNumber,
  ifscCode,delegateName,portfolio
}: TemplateParams &{delegateName:string,portfolio:string} ) =>`<div style=" font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; color: #333; padding: 20px; max-width: 800px; margin: auto; border-radius: 10px; ">
       <div style="display: flex; align-items: center; width: 100%;justify-content:space-between; ">
        <h1 style="color: #b55e06; text-align: center; font-size:35px; ">MACE MUN’25</h1> 
        <img src="https://i.pinimg.com/736x/fe/a7/1b/fea71bf667fe4ae819524772f6019cf5.jpg" style="width:50%;" alt="no image">
       </div>
       
        <h3 style="color: #b55e06; background:#f8e0a0; padding: 10px; text-align: center; border-radius: 5px;">${committeeName}</h3>
        
        <p>Greetings <strong>${delegateName}</strong>!</p>
        
        <p>Thank you for applying to MACE MUN’25.</p>
        
        <p>We are pleased to inform you that you have been allotted in the second round of Delegate Applications of MACE MUN’25, scheduled to be held from <strong>14th to 16th March 2025</strong>, at <strong>Mar Athanasius College of Engineering, Kothamangalam, Kerala</strong>.</p>
        
        <p >Kindly find your allotment:</p>
        <h2 style="text-align: center;color: #b55e06; "><strong>Portfolio:</strong> ${portfolio}</h2>
        
        <p>All delegates, regardless of individual or institutional delegation, are requested to submit a payment of <strong>1599 INR</strong>. Institutional delegations will be duly recognized by the secretariat, and a refund of <strong>200 INR</strong> will be issued upon meeting the delegation criteria.</p>
        
        <h4 style="text-align: center;color: #b55e06; ">Delegation Criteria:</h4>
       <p style="text-align: center; ">College delegation: Minimum <b>12</b> delegates. <br>
       School delegation: Minimum <b>10</b> delegates. 
        </p>
        <p>(Please note that as long as your institution does not satisfy the delegation criteria, you will be considered as an individual delegate.)</p>
        
        <h3 style="text-align: center;color: #b55e06; ">Fee Structure:</h3>
        <p style="text-align: center;">
            Individual Delegate: 1599 INR <br>
Institutional Delegate: 1399 INR <br>
MACE-ian: 999 INR <br>

        </p>
        
        <h3 style="text-align: center;color: #b55e06; ">Additional rates for accommodation are as follows:</h3>
        <p style="text-align: center;">
            Hostel: 599 INR (2 nights Included) <br>
            Hotel: 1899 INR (2 nights Included) <br>
            
            Please find below the details for making the payment: <br> <br>
            <div style="display: grid; flex-direction: column">
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">Name: ${accountName}</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">UPI: ${upiId}</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">Account Number: ${accountNumber}</p> 
                <p style="text-align: center; color: #b55e06; margin: 5px 0; font-size:large; font-weight: bold;">IFSC:  ${ifscCode}</p>
            </div>
        </p>
        
        <p>As you may be aware, the registration fee covers the costs of organizing the event, including venue rental, food for 3 days and a delegate kit. It also helps us in providing an enriching experience to all the attendees. Therefore, we highly value your contribution and participation in this event</p>
        
        <p>We request you to confirm your portfolio by paying the delegate's fees on or before 2nd March 5:00 PM to expedite the process of allocation. 
            Kindly fill out this form and confirm your portfolio.
            </p>
        
        <p style="text-align: center;"><a href="https://bit.ly/Portfolioconfirmation" target="_blank" style="color: #0044cc; text-decoration: none;"><b>https://bit.ly/Portfolioconfirmation</b> </a></p>
        
        <p>You are eligible to apply for a re-allotment if you are unsatisfied with the present one after paying the delegates' fee.</p>
        
        <p>Kindly please note that we follow a <b>zero refund</b> policy, but we facilitate replacements.</p>
        
        <p>Thank you for your cooperation and support. We look forward to your participation and a great munn-ing experience.</p>
        <p>For any queries, please feel free to contact the undersigned.</p>
        <p>Thank you.</p>
         <br>
         <p style="color: #ca8d4f;"><i>Regards,</i></p><b></b>
         <p style="color: #ca8d4f;"><i>Secretariat,<br>
            MACE MUN‘25
            </i></p>
         <br>
            <hr style="width:90%; height: .8px; background-color: #000000; border: none;">
            <br>
            <div class="payment" style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; justify-content: center; align-items: center; width: 100%; text-align: center;">
                <div style="text-align: center;  overflow-wrap: break-word;">
                    <i>Ann Martin <br> +91 6235867437 <br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
                <div style="text-align: center;  overflow-wrap: break-word;">
                    <i>Jithin Reji <br> +91 9188810189 <br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
                <div style="text-align: center; overflow-wrap: break-word;">
                    <i>Sarah Treesa Jose <br>+91 8078330295<br><span style="color: #ca8d4f;">Delegate Affairs</span></i>
                </div>
            </div>              
        <p style="text-align: center;"><a href="https://macemun.in" target="_blank" style="color:#ca8d4f;  text-decoration: none;">macemun.in</a></p>
       <p style="text-align: center;"><a href="https://www.instagram.com/macemun_25/" target="_blank" style="color:#ca8d4f;  text-decoration: none;">instagram</a></p>
    </div>`;

    const committeeDetails = {
      'disec': {
        committeeName: 'DISEC - Disarmament and International Security Committee',
        accountName: 'Ann Martin',
        upiId: 'annmartinkunnath-1@oksbi',
        accountNumber: '35112340849',
        ifscCode: 'SBIN0071100'
      },
      'ecosoc': {
        committeeName: 'ECOSOC- Economic and Social Council',
        accountName: 'Sarah Treesa Jose',
        upiId: 'sarahtj1621@okaxis',
        accountNumber: '13070100179231',
        ifscCode: 'FDR0001307'
      },
      'icj': {
        committeeName: 'ICJ- The International Court of Justice',
        accountName: 'Jithin Reji',
        upiId: 'jithinreji185@oksbi',
        accountNumber: '41356236550',
        ifscCode: 'SBIN0070449'
      },
      'ip': {
        committeeName: 'IP- International Press',
        accountName: 'Jithin Reji',
        upiId: 'jithinreji185@oksbi',
        accountNumber: '41356236550',
        ifscCode: 'SBIN0070449'
      },
      'kla': {
        committeeName: 'KLA- Kerala Legislative Assembly',
        accountName: 'Diya Biju',
        upiId: 'diyabiju25@oksbi',
        accountNumber: '38175852727',
        ifscCode: 'SBIN0070200'
      },
      'unhrc': {
        committeeName: 'UNHRC- United Nations Human Rights Council',
        accountName: 'Hannah Elza Jose',
        upiId: 'hannahjose13@okhdfcbank',
        accountNumber: '150013032003',
        ifscCode: 'INDB0000564'
      },
      // Add other committees here with their specific details
    }; 
    
export async function GET(request: Request) {
  try {
    console.log(request)
    const subject = "MACE MUN'25 Round 2 Allocation";
    const excelFilePath = path.join(process.cwd(), 'public', 'samplesheet.xlsx');

    const excelBuffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(excelBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    const results = [];
    const errors = [];
    // Read and convert image to base64
    

    for (const row of data) {
      //@ts-ignore
      const delegateName = row[Object.keys(row)[0]];
      //@ts-ignore
      const email = row[Object.keys(row)[2]];
      //@ts-ignore
      const Comittee = row[Object.keys(row)[3]];
      //@ts-ignore
      const portfolio = row[Object.keys(row)[4]];

      if (email && typeof email === 'string' && email.includes('@')) {
        // Different HTML content based on team
        //@ts-ignore
        const details:TemplateParams = committeeDetails[Comittee.toLowerCase()];
        //@ts-ignore
        const htmlContent =Comittee.toLowerCase()=='sochum'?emailTemplate2({delegateName: delegateName,
          portfolio:portfolio}) : 
          emailTemplate({
          ...details,
          delegateName: delegateName,
          portfolio:portfolio  // Pass the volunteerName here
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject,
          html:htmlContent
        };

        try {
          await delay(1000);
          await sendEmailWithRetry(mailOptions);
          results.push(email);
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          //@ts-ignore
          errors.push({ email, error: error.message });
        }
      }
    }

    console.log("mail sending done");
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
