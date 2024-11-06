import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envVarsSchema = z.object({
  PORT: z.string().default("80").transform((str) => parseInt(str, 10)),  
  DB_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  REDIRECT_URI: z.string().url(),
  FRONTEND_REDIRECT_URL_local: z.string().url(),
  FRONTEND_REDIRECT_URL: z.string().url(),
  FRONTEND_URL_local: z.string().url(),
  JWT_SECRET: z.string(),
  EXPIREATION_MINUTE:z.string(),
  TWILIO_accountSid: z.string(),
  TWILIO_authToken: z.string(),
  META_PHONE_ID:z.string(),
  META_ACCESS_TOKEN: z.string(),
  MAIL_API_KEY:z.string()
});

const envVars = envVarsSchema.parse(process.env);
export const envConfigs = {
  port: envVars.PORT || 8080,
  databaseUrl:envVars.DB_URL,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  redirectUri: envVars.REDIRECT_URI,
  frontendRedirectUrlLocal: envVars.FRONTEND_REDIRECT_URL_local,
  frontendRedirectUrl: envVars.FRONTEND_REDIRECT_URL,
  frontendUrlLocal: envVars.FRONTEND_URL_local,
  jwtsecret:envVars.JWT_SECRET,
  accessExpirationMinutes:envVars.EXPIREATION_MINUTE,
  twilioAccountSid: envVars.TWILIO_accountSid,
  twilioauthToken: envVars.TWILIO_authToken,
  metaPhoneId: envVars.META_PHONE_ID,
  metaAccessToken: envVars.META_ACCESS_TOKEN,
  mailApiKey:envVars.MAIL_API_KEY
};
