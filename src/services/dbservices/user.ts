import {and, desc, eq, inArray, sql} from "drizzle-orm";
import postgreDb from "../../config/db";
import { eventData, userss } from "../../models/schema";

export class User {

  static saveDetails:any = async(userId:any,appId:any,deviceId:any):Promise<any>=>{
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