import {Request,Response} from "express"
import { envConfigs } from "../config/envconfig";
import axios from "axios";
import dbservices from "../services/dbservices";
import url from "node:url";
import WhatsappService from "../services/whatsapp";
import Twillio from "../services/twilio";
import { OtpVerificationMethods } from "../enums";
import { generateAuthTokens } from "../config/token";
import { otpToken } from "../helper/common";


export class auth{

    static googleSignInSignUp =  async(req:Request,res:Response)=>{
        try {
          const token = req.query.code;
          let clientId = envConfigs.googleClientId;
          let clientSecret = envConfigs.googleClientSecret;
          let REDIRECT_URI = envConfigs.redirectUri;
          const validateUser = await axios.post(`https://oauth2.googleapis.com/token`,{code:token,client_id: clientId,client_secret: clientSecret,redirect_uri:REDIRECT_URI,grant_type: "authorization_code"});
          const { id_token, access_token } = validateUser.data;
          const {email,name,picture} = await axios
          .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
              headers: {
                Authorization: `Bearer ${id_token}`,
              },
            }
          )
          .then((res) => res.data)
          .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
          });
          if(!email) throw new Error("Error fetching email please try again");
  
  
          let userExists = await dbservices.auth.login({email},true);
          if (!userExists) {
            const createBody = {
                email: email,
                name: name,
                avatar:picture,
            };
            userExists=await dbservices.auth.register(createBody,true); 
          }
          let FRONTEND_REDIRECT_URL = envConfigs.frontendRedirectUrlLocal;
  
          return res.redirect(url.format({
            pathname:`${FRONTEND_REDIRECT_URL}`,
            query:{user:JSON.stringify(userExists)}
          }));
        } catch (error) {
          console.log(error);
          // return res.redirect(url.format({
          //   pathname:`${FRONTEND_REDIRECT_URL}`,
          //   query:{
          //     error_message:error["message"]
          //   }
          // }));
        }
      }

    static emaillogin = async(req:Request,res:Response)=>{
      try {
        const {email} = req.body;
        let otp = await Twillio.sendEmail(email);
        let token = otpToken(email,otp);
        return res.status(200).send({status:true,message:"OTP Sent SuccessFully",token})
      } catch (error) {
        // logger.error(`Error Logging you in: ${error.message}`);
        return res.status(500).send({status:false,message:error.message});
      }
    }
    
      static sendWhatsAppOtp = async (req:Request,res:Response)=>{
        try{
        const {phone,countryCode} = req.body;
        const otp = WhatsappService.generateWhatsAppOtp(phone);
        const hash = WhatsappService.otpHash(phone,otp);
        const signedOtpToken = WhatsappService.generateJWT({otp:hash,phone});
        await Twillio.sendWhatsAppOtp(otp,phone,countryCode);
        return res.status(200).send({status:true,token:signedOtpToken,message:`We have sent you an otp over whatsapp`});
        // return res.cookie("otpToken",signedOtpToken,{expires:new Date(Date.now() + (Constants.otpExpireDurationInMin*60*1000)), httpOnly:true}).sendStatus(200);
        }
        catch(error){
          return res.status(500).send({status:false,message:error.message});
        }
    }


    static verifyOtp = async(req:Request,res:Response)=>{
        try {
          const {otp,method} = req.body;
          let userExists = await WhatsappService.verifyOtp(req.user as any,otp,method);
          let message = "User Logged In";
          let newUser = false;
          if (!userExists) {
            const createBody:any = {
              name:`Anonymous ${Math.floor(Math.random() * 1000)}`,
            };
            if(method===OtpVerificationMethods.EMAIL){
              createBody.email = req.user['email'];
            }
            else if(method===OtpVerificationMethods.WHATSAPP){
              createBody.phone = req.user['phone'];
            }
            userExists = await dbservices.auth.createNewUser(createBody);
            message = "User Signed Up";
            newUser = true;
          }
          const token = generateAuthTokens(userExists[0].userId);
          return res.status(200).send({
            status: true,
            message,
            username: userExists.name,
            token: token,
          });
        } catch (error) {
          return res.status(500).send({status:false,message:error.message});
        }
      }
}