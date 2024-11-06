import express from "express"
import controllers from "../controllers";
import validators from "../validators";
import { validateRequest } from "../middleware";
const router=express.Router()

router.get('/google-login',validateRequest(validators.auth.googleLogin),controllers.auth.googleSignInSignUp);
router.post("/email-login",validateRequest(validators.auth.login), controllers.auth.emaillogin);
router.post("/whatsAppLogin",validateRequest(validators.auth.whatsAppLogin), controllers.auth.sendWhatsAppOtp);
router.post("/verify-otp",validateRequest(validators.auth.verifyOtp), controllers.auth.verifyOtp);
router.post("/spotify-login",validateRequest(validators.auth.spotifyLogin),controllers.auth.spotifyOauthHandler);


export default router