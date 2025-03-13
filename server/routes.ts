import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from 'jsonwebtoken';
import { createSession, validateSession, endSession, refreshSession } from './session';
import {
  loginSchema, insertUserSchema, insertVendorSchema, 
  insertRouteSchema, insertTicketSchema, insertActivitySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createDatabaseBackup, listBackups } from './backup';

// JWT Secret (in production, this would be an environment variable)
const JWT_SECRET = "tiyende-super-secret-key";
const JWT_EXPIRES_IN = "24h";

// Middleware to validate JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Admin privileges required" });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const api = "/api";

  // Handle validation errors
  const handleValidationError = (err: unknown) => {
    console.error("Validation error:", err);
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      console.error("Zod validation error details:", validationError);
      return validationError.message;
    }
    return err instanceof Error ? err.message : "Validation error";
  };

  // Auth routes
  app.post(`${api}/login`, async (req, res) => {
    try {
      console.log("Login request received. Body:", req.body);

      // Get username and password from request body
      const { username, password } = req.body || {};
      console.log("Extracted credentials:", { username, password });

      // For testing: allow any username/password if provided
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user exists in the system
      let user = await storage.getUserByUsername(username);

      // For testing: If user doesn't exist, create a test user
      if (!user) {
        // Create a new testing user
        user = await storage.createUser({
          username,
          password, // Store plain text for testing
          email: `${username}@test.com`,
          fullName: username,
          role: "admin",
          active: true
        });
      }

      // Create a new session
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const token = await createSession(user.id, ipAddress, userAgent);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        token
      });
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.post(`${api}/logout`, authenticateToken, async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await endSession(token);
    }

    res.json({ message: "Logged out successfully" });
  });

  app.post(`${api}/refresh-token`, async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const newToken = await refreshSession(token);
    if (!newToken) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    res.json({ token: newToken });
  });

  // User routes
  app.get(`${api}/users`, authenticateToken, requireAdmin, async (req, res) => {
    const users = await storage.listUsers();
    // Don't send passwords to client
    const safeUsers = users.map(({ password, token, ...user }) => user);
    res.json(safeUsers);
  });

  app.post(`${api}/users`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);

      // Don't send password to client
      const { password, token, ...safeUser } = user;

      res.status(201).json(safeUser);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/users/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password to client
    const { password, token, ...safeUser } = user;

    res.json(safeUser);
  });

  app.patch(`${api}/users/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      // Allow partial updates
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password to client
      const { password, token, ...safeUser } = user;

      res.json(safeUser);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/users/:id`, authenticateToken, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(204).send();
  });

  // Vendor routes
  app.get(`${api}/vendors`, authenticateToken, async (req, res) => {
    const vendors = await storage.listVendors();
    res.json(vendors);
  });

  app.post(`${api}/vendors`, authenticateToken, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const vendor = await storage.getVendor(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  });

  app.patch(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    try {
      // Allow partial updates
      const vendorData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(id, vendorData);

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/vendors/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid vendor ID" });
    }

    const deleted = await storage.deleteVendor(id);
    if (!deleted) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(204).send();
  });

  // Route routes
  app.get(`${api}/routes`, authenticateToken, async (req, res) => {
    const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : null;

    let routes;
    if (vendorId && !isNaN(vendorId)) {
      routes = await storage.getRoutesByVendor(vendorId);
    } else {
      routes = await storage.listRoutes();
    }

    res.json(routes);
  });

  app.post(`${api}/routes`, authenticateToken, async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);

      // Validate vendor exists
      const vendor = await storage.getVendor(routeData.vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Vendor not found" });
      }

      const route = await storage.createRoute(routeData);
      res.status(201).json(route);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    const route = await storage.getRoute(id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(route);
  });

  app.patch(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    try {
      // Allow partial updates
      const routeData = insertRouteSchema.partial().parse(req.body);

      // If vendorId is provided, validate vendor exists
      if (routeData.vendorId) {
        const vendor = await storage.getVendor(routeData.vendorId);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor not found" });
        }
      }

      const route = await storage.updateRoute(id, routeData);

      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      res.json(route);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.delete(`${api}/routes/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    const deleted = await storage.deleteRoute(id);
    if (!deleted) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(204).send();
  });

  // Ticket routes
  app.get(`${api}/tickets`, authenticateToken, async (req, res) => {
    const routeId = req.query.routeId ? parseInt(req.query.routeId as string) : null;
    const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : null;

    let tickets;
    if (routeId && !isNaN(routeId)) {
      tickets = await storage.getTicketsByRoute(routeId);
    } else if (vendorId && !isNaN(vendorId)) {
      tickets = await storage.getTicketsByVendor(vendorId);
    } else {
      tickets = await storage.listTickets();
    }

    res.json(tickets);
  });

  app.post(`${api}/tickets`, authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);

      // Validate route exists
      const route = await storage.getRoute(ticketData.routeId);
      if (!route) {
        return res.status(400).json({ message: "Route not found" });
      }

      // Validate vendor exists
      const vendor = await storage.getVendor(ticketData.vendorId);
      if (!vendor) {
        return res.status(400).json({ message: "Vendor not found" });
      }

      const ticket = await storage.createTicket(ticketData);
      res.status(201).json(ticket);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  app.get(`${api}/tickets/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await storage.getTicket(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  });

  app.patch(`${api}/tickets/:id`, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    try {
      // Allow partial updates
      const ticketData = insertTicketSchema.partial().parse(req.body);

      // If routeId is provided, validate route exists
      if (ticketData.routeId) {
        const route = await storage.getRoute(ticketData.routeId);
        if (!route) {
          return res.status(400).json({ message: "Route not found" });
        }
      }

      // If vendorId is provided, validate vendor exists
      if (ticketData.vendorId) {
        const vendor = await storage.getVendor(ticketData.vendorId);
        if (!vendor) {
          return res.status(400).json({ message: "Vendor not found" });
        }
      }

      const ticket = await storage.updateTicket(id, ticketData);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  // Settings routes
  app.get(`${api}/settings`, authenticateToken, async (req, res) => {
    const settings = await storage.listSettings();
    res.json(settings);
  });

  app.post(`${api}/settings/:name`, authenticateToken, requireAdmin, async (req, res) => {
    const { name } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ message: "Value is required" });
    }

    const setting = await storage.updateSetting(name, value);

    // Handle special settings
    if (name === "automatic_backups") {
      try {
        const { scheduleBackups } = require('./backup');
        await scheduleBackups(value === "true" || value === true);
      } catch (error) {
        console.error("Failed to update backup schedule:", error);
      }
    }

    res.json(setting);
  });

  // Backup management routes
  app.post(`${api}/backups`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backupPath = await createDatabaseBackup();
      if (backupPath) {
        await storage.createActivity({
          userId: (req as any).user.id,
          action: "Created database backup",
          details: { path: backupPath }
        });
        res.status(201).json({ message: "Backup created successfully", path: backupPath });
      } else {
        res.status(500).json({ message: "Failed to create backup" });
      }
    } catch (error) {
      res.status(500).json({ message: `Backup error: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  app.get(`${api}/backups`, authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backups = await listBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ message: `Error listing backups: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  // Dashboard stats
  app.get(`${api}/dashboard`, authenticateToken, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Activities
  app.get(`${api}/activities`, authenticateToken, async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await storage.listActivities(limit);
    res.json(activities);
  });

  app.post(`${api}/activities`, authenticateToken, async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);

      // Set userId from token if not provided
      if (!activityData.userId) {
        activityData.userId = (req as any).user.id;
      }

      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (err) {
      res.status(400).json({ message: handleValidationError(err) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}