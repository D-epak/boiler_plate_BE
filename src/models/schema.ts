import { serial,varchar,pgTable,primaryKey, jsonb } from 'drizzle-orm/pg-core';


export const userss: any = pgTable("usersss", {
  id: serial("id"),
  userId:varchar("user_id").unique(),
  appId:varchar("app_id"),
  deviceId:varchar("device_id")
}, (table) => ({
  pk: primaryKey({ columns: [table.id] }),
}));
  export const eventData:any = pgTable("eventData",{
    id:serial("id"),
    userId: varchar("user_id").references(() => userss.userId),
    eventId: varchar("eventId"),
    name: varchar("name"),
    type: varchar("type").unique(),
    eventDetails: varchar("event_details"),
  })



  