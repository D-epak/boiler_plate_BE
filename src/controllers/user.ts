import { Request, Response } from "express";
import dbservices from "../services/dbservices";
import uniqid from 'uniqid';
import crypto from "crypto";
import { Say } from "twilio/lib/twiml/VoiceResponse";

export class User {

  static saveDetails:any = async(req:Request,res:Response)=>{
    try{
      let {appId,deviceId,userId} = req.body
      if(!userId) userId = `user${Math.random().toString(36).substring(2, 5)}`
      const data = await dbservices.User.saveDetails(userId,appId,deviceId)
      if(!data) throw new Error("Error In inserting Data")
      return res.status(200).send({message:"Details Save",data:data})
    }catch(error:any){
      // console.log("Error::",error)
      return res.status(500).json({ status: false, message: error});
    }
  }

  static eventDetails:any = async(req:Request,res:Response)=>{
    try{
      const eventId = `event${Math.random().toString(36).substring(2, 5)}`
      const eventDetails = req.body
      // console.log(eventDetails)
      const data = await dbservices.User.eventDetails(eventId,eventDetails)
      // console.log("Data",data)
      if(!data) throw new Error("Error In inserting Data")
      return res.status(200).json({message:"save Events Successfully"})
    }catch(error:any){
      console.log(error);
     return res.status(500).json({ status: false, message: error.mesage });
    }
  }


}