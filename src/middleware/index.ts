import { getUser } from "../config/token";
import z,{ AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';



const authenticateUser=(req,res,next)=>{
    try{
      const getToken = req.headers.authorization;
      if(!getToken){
        throw new Error("Token not Found");
      }
      const user = getUser(getToken)
      if(!user){
        throw new Error("User not Found");
      }
      req.user=user
      next();
    }catch(err){
      if(res)res.status(400).send({message:err})
      return null;
    }
}

export const validateRequest =(schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
    try {
    const sanitizedValues = await schema.parseAsync({
    body: req.body,
    query: req.query,
    params: req.params,
    });
    req.body = sanitizedValues.body;
    req.query = sanitizedValues.query;
    req.params = sanitizedValues.params;
    return next();
    } catch (error) {
    const validationErrors: { [key: string]: string } = {};

    (error as ZodError).errors.forEach((errorMessage) => {
        const fieldName = errorMessage.path.join(".");
        validationErrors[fieldName] = errorMessage.message;
    });

    res.status(400).json({ errors: validationErrors });
    }
    };

    


export default authenticateUser