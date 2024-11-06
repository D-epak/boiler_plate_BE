import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import moment from 'moment';
import jwt from "jsonwebtoken";
import { envConfigs } from './envconfig';
import { TokenTypes } from '../enums';

export const generateAuthTokens = (payload: { userId:number }) => {
  const accessTokenExpires = moment().add(
    envConfigs.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = jwt.sign(JSON.stringify({
    userId: payload.userId,
    type: TokenTypes.ACCESS, // Include the token type
    exp: accessTokenExpires.unix() // Set expiration time in UNIX timestamp format
  }), envConfigs.jwtsecret);

  return accessToken;
}

const jwtOptions = {
  secretOrKey: envConfigs.jwtsecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== TokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    if(!payload && Object.keys(payload).length <=3 && (!payload.userId && typeof parseInt(payload.userId) !== "number") && (!payload.userName && typeof payload.userName !== "string") && !payload.isOnboarded ) throw new Error("Invalid Token"); 
    done(null, payload);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);