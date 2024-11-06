import postgreDb from "../../config/db";
import { eq  } from "drizzle-orm"
import { users } from "../../models/schema"
import { bcryptPassword, validatePassword } from "../../config/passwordHash";
import { generateAuthTokens } from "../../config/token";


export class auth{

    static generateId = () => Math.random().toString(36).substr(2, 8).toUpperCase();

    static insertUser = async(details:any,tx:any,fromGoogle:boolean)=>{
        try {
          return await tx.insert(users)
          .values({
            userId: this.generateId(),
            name: details.name,
            email: details.email,
            password: fromGoogle ? null : await bcryptPassword(details.password),
          })
          .onConflictDoNothing({ target: users.email })
          .returning({
            id: users.id,
            userid: users.userId,
            name: users.name,
            email: users.email,
          });
        } catch (error) {
          throw new Error(error);
        }
      }

    static userDetails = async (users: any) => {
        const Token=generateAuthTokens(users.id)
        return {
          userid: users.userId,
          name: users.name,
          email: users.email,
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
                userId: users.id,
                name: users.name,
                email: users.email,
                password: users.password
              }).from(users).where(eq(users.email, details.email));
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
            userId: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone
          }).from(users).where(eq(users.email, details.email))
          return findUser[0].userId;
        } catch (error) {
          throw new Error(error.message)
        }
      }     
      
      
      static getUserbyPhone = async(details:any):Promise<any>=>{
        try {
          const findUser = await postgreDb.select({
            userId: users.userId,
            name: users.name,
            email: users.email,
            phone: users.phone
          }).from(users).where(eq(users.phone, details.phone))
          return findUser;

        } catch (error) {
          throw new Error(error.message)
        }
      }   
      
      
      static createNewUser = async (user: any): Promise<any> => {
        try {
          return await postgreDb.transaction(async(tx)=>{
            if(user.email){
              const isEmailExists = await tx.select({}).from(users).where(eq(user.email.toLowerCase(),users.email));
              if(isEmailExists.length) throw new Error('duplicate email')
              user.email = user.email.toLowerCase();
            }
            if(user.phone){
              const isPhoneExists = await tx.select({}).from(users).where(eq(user.phone,users.phone));
              if(isPhoneExists.length) throw new Error('duplicate phone')
            }
            const newUser = await tx.insert(users).values({
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
       
    }