import { serial,varchar,pgTable,primaryKey } from 'drizzle-orm/pg-core';


export const users:any=pgTable("user",{
    id:serial("id"),
    userId:varchar("user_id"),
    name:varchar("name"),
    email:varchar("email").unique(),
    password:varchar("password"),
    phone: varchar("phone", { length: 16 }).unique(),
  }, (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  }))

  