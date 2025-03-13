import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);
export const vendorStatusEnum = pgEnum('vendor_status', ['active', 'inactive', 'pending']);
export const routeStatusEnum = pgEnum('route_status', ['active', 'inactive']);
export const ticketStatusEnum = pgEnum('ticket_status', ['paid', 'pending', 'refunded', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['mobile_money', 'credit_card', 'cash', 'bank_transfer']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default('staff').notNull(),
  active: boolean("active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  token: text("token"),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  status: vendorStatusEnum("status").default('active').notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Routes table
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  departure: text("departure").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  estimatedArrival: text("estimated_arrival"),
  fare: integer("fare").notNull(),
  capacity: integer("capacity").default(44).notNull(),
  status: routeStatusEnum("status").default('active').notNull(),
  daysOfWeek: text("days_of_week").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  bookingReference: text("booking_reference").notNull().unique(),
  routeId: integer("route_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  seatNumber: integer("seat_number").notNull(),
  status: ticketStatusEnum("status").default('pending').notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentReference: text("payment_reference"),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  travelDate: timestamp("travel_date").notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  details: json("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  token: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  bookingDate: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;
