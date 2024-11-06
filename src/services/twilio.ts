
import axios from 'axios';
import { envConfigs } from '../config/envconfig';
import twilio from 'twilio';

export default class Twillio{
  static formHtmlContent = (otp:string|number)=>{
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Astrix</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">Hey there,</h2>
            <p>Thanks for joining <strong>Astrix</strong>! We're excited to have you here.</p>
            <p>Your One-Time Password (OTP) for login - <strong>${otp}</strong> Heads up, this code expires in 10 minutes!</p>
            <p>Should you need any help or have questions, our support team is always on standby. Reach out to us at <a href="mailto:support@astrix.live">support@astrix.live</a> or call us at +91-9849484661. You can also visit our <a href="https://www.astrix.live/faq" target="_blank">FAQ section</a> for quick answers.</p>
            <p>Best,<br>
            Team Astrix</p>
        </div>
    </body>
    </html>
    `

  }

  static generateOtp = async()=>{
    try {
      return Math.floor(100000 + Math.random() * 900000);
    } catch (error) {
      throw new Error(error);
    }
  }

  
  static sendEmail = async(to:string)=>{
    try {
      const otp = await this.generateOtp();
      let htmlContent = this.formHtmlContent(otp);

      const options = {
        method: 'POST',
        url: 'https://api.brevo.com/v3/smtp/email',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': envConfigs.mailApiKey
        },
        data: {
          sender: {name: 'Astrix.live', email: 'hello@astrix.live'},
          to: [{email: to, name: 'User'}],
          subject: `Welcome to Sample - Your OTP ${otp}.`,
          htmlContent: htmlContent,
        }
      };
      await axios.request(options);
      return otp;
    } catch (error) {
      throw new Error(error);
    }
  }

  static sendWhatsAppOtp = async(otp:string|number,phone:number|string,countryCode:string="+91")=>{
    try{
      await this.sendGraphApiWhatsappOtp(String(otp),countryCode+phone);
    }
    catch(error){
      throw new Error(`Error while sending whats app otp`);
    }
  }

  static sendWhatsAppMessage = async (message:string,phone:number|string)=>{
    try{
      const accountSid = envConfigs.twilioAccountSid;
      const authToken = envConfigs.twilioauthToken;
      
      const client = twilio(accountSid,authToken);
      
      await client.messages.create({
        body: message,
        from: `whatsapp:+14155238886`,
        to: `whatsapp:${phone}`,
      });

    }
    catch(error){
      throw new Error(error.message);
    }
  }

  static sendGraphApiWhatsappOtp = async (otp:string,phone:string)=>{
    const url = `https://graph.facebook.com/v20.0/${envConfigs.metaPhoneId}/messages`;

    const data = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": phone,
      "type": "template",
      "template": {
        "name": "login_astrix",
        "language": {
          "code": "en"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                type: 'text',
                text: otp 
              }
            ]
          },
          {
            "type": "button",
            "sub_type": "url",
            "index": "0",
            "parameters": [
              {
                "type": "text",
                "text": otp
              }
            ]
          }
        ]
      }
    }
      // const data1 = {
      // "messaging_product": "whatsapp",
      // "recipient_type": "individual",
      // "to": phone,
      // "type": "template",
      // "template": {
      //   "name": "hello_world",
      //   "language": {
      //     "code": "en_US"
      //   }
      // }
    // }

  try {
    await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${envConfigs.metaAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending whatsapp message:',error.message);
  }
}
  // }
  // static sendGraphApiWhatsappOtp = async (otp:string,phone:string)=>{
  //   const url = `https://graph.facebook.com/v18.0/${envConfigs.meta.phoneId}/messages`;
  //   const data = {
  //     "messaging_product": "whatsapp",
  //     "recipient_type": "individual",
  //     "to": phone,
  //     "type": "template",
  //     "template": {
  //       "name": "hello_world",
  //       "language": {
  //         "code": "en_US"
  //       }
  //     }
  //   }

  // try {
  //   const response = await axios.post(url, data, {
  //     headers: {
  //       'Authorization': `Bearer ${envConfigs.meta.accessToken}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   console.log('response: ',response.data);
  // } catch (error) {
  //   console.error('Error sending message:', error.response ? error.response.data : error.message);
  // }
  // }
}
