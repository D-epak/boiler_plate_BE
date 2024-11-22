import postgreDb from "../../config/db";
import { eq  } from "drizzle-orm"
import { eventData, userss } from "../../models/schema"
import { bcryptPassword, validatePassword } from "../../config/passwordHash";
import { generateAuthTokens } from "../../config/token";


export class auth{

    static generateId = () => Math.random().toString(36).substr(2, 8).toUpperCase();

    static insertUser = async(details:any,tx:any,fromGoogle:boolean)=>{
        try {
          return await tx.insert(userss)
          .values({
            userId: this.generateId(),
            name: details.name,
            email: details.email,
            password: fromGoogle ? null : await bcryptPassword(details.password),
          })
          .onConflictDoNothing({ target: userss.email })
          .returning({
            id: userss.id,
            userid: userss.userId,
            name: userss.name,
            email: userss.email,
          });
        } catch (error) {
          throw new Error(error);
        }
      }

    static userDetails = async (userss: any) => {
        const Token=generateAuthTokens(userss.id)
        return {
          userid: userss.userId,
          name: userss.name,
          email: userss.email,
          token:Token
        }
      }
   
      static register=async(details:any,fromGoogle:boolean):Promise<any>=>{
        try {
          return await postgreDb.transaction(async (tx) => {
            const registerUser= await this.insertUser(details,tx,fromGoogle)
            if(registerUser.length<=0) throw new Error("User already exists");
            return this.userDetails(registerUser[0])
          });
        } catch (error) {
          throw new Error(error)
        }
    
      }

    static login = async(details:any,fromGoogle:boolean):Promise<any>=>{
        try{
              const findUser = await postgreDb.select({
                userId: userss.id,
                name: userss.name,
                email: userss.email,
                password: userss.password
              }).from(userss).where(eq(userss.email, details.email));
        if (findUser){
            if(fromGoogle){
              return this.userDetails(findUser)
            }else{
              const hashPassword=await validatePassword(details.password,findUser[0].password)
              if (hashPassword) return this.userDetails(findUser)
              else throw new Error("Enter Valid Password")
            }
          }
          else{
            if(fromGoogle) return null;
            throw new Error("Please enter valid Email") 
          } 
        }catch(error){
          throw new Error(error.message)
        }
      }

      static getUserbyEmail = async(details:any):Promise<any>=>{
        try {
          const findUser = await postgreDb.select({
            userId: userss.id,
            name: userss.name,
            email: userss.email,
            phone: userss.phone
          }).from(userss).where(eq(userss.email, details.email))
          return findUser[0].userId;
        } catch (error) {
          throw new Error(error.message)
        }
      }     
      
      
      static getUserbyPhone = async(details:any):Promise<any>=>{
        try {
          const findUser = await postgreDb.select({
            userId: userss.userId,
            name: userss.name,
            email: userss.email,
            phone: userss.phone
          }).from(userss).where(eq(userss.phone, details.phone))
          return findUser;

        } catch (error) {
          throw new Error(error.message)
        }
      }   
      
      
      static createNewUser = async (user: any): Promise<any> => {
        try {
          return await postgreDb.transaction(async(tx)=>{
            if(user.email){
              const isEmailExists = await tx.select({}).from(userss).where(eq(user.email.toLowerCase(),userss.email));
              if(isEmailExists.length) throw new Error('duplicate email')
              user.email = user.email.toLowerCase();
            }
            if(user.phone){
              const isPhoneExists = await tx.select({}).from(userss).where(eq(user.phone,userss.phone));
              if(isPhoneExists.length) throw new Error('duplicate phone')
            }
            const newUser = await tx.insert(userss).values({
                userId: this.generateId(),
                name: user.name,
                email: user.email,
                password:  null 
              })           
               return newUser[0];

          });
        } catch (error) {
          throw new Error(error.message);
        }
      };

      static saveDetails = async(userId:any,appId:any,deviceId:any):Promise<any>=>{
        try{
            return await postgreDb.insert(userss).values({
                userId:userId,
                appId:appId,
                deviceId:deviceId
            }).returning({users:userss.userId})
        }catch(error:any){
            throw new Error(error)
        }

      }

      static eventDetails = async(eventId:any,data:any):Promise<any>=>{
        try{
          //  console.log(userId,eventId,data, data.name, data.type)
            const result =  await postgreDb.insert(eventData).values({
                userId:data.userId,
                eventId:eventId,
                name:data.name,
                type:data.type,
                eventDetails:data.eventDetails
            })
            // console.log("varun Kate",result)
            return result;
        }catch(error){
            throw new Error(error)
        }
      }

       
  }