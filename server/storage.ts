import { 
  users, type User, type InsertUser, 
  vendors, type Vendor, type InsertVendor,
  routes, type Route, type InsertRoute,
  tickets, type Ticket, type InsertTicket,
  settings, type Setting, type InsertSetting,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  setUserToken(id: number, token: string): Promise<boolean>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  listVendors(): Promise<Vendor[]>;
  deleteVendor(id: number): Promise<boolean>;
  
  // Route operations
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  listRoutes(): Promise<Route[]>;
  getRoutesByVendor(vendorId: number): Promise<Route[]>;
  deleteRoute(id: number): Promise<boolean>;
  
  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByReference(reference: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  listTickets(): Promise<Ticket[]>;
  getTicketsByRoute(routeId: number): Promise<Ticket[]>;
  getTicketsByVendor(vendorId: number): Promise<Ticket[]>;
  
  // Settings operations
  getSetting(name: string): Promise<Setting | undefined>;
  updateSetting(name: string, value: string): Promise<Setting | undefined>;
  listSettings(): Promise<Setting[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(limit?: number): Promise<Activity[]>;
  
  // Analytics operations
  getDashboardStats(): Promise<DashboardStats>;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeVendors: number;
  activeRoutes: number;
  recentBookings: Ticket[];
  recentActivities: Activity[];
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendors: Map<number, Vendor>;
  private routes: Map<number, Route>;
  private tickets: Map<number, Ticket>;
  private settings: Map<string, Setting>;
  private activities: Activity[];
  
  private userId: number = 1;
  private vendorId: number = 1;
  private routeId: number = 1;
  private ticketId: number = 1;
  private settingId: number = 1;
  private activityId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.routes = new Map();
    this.tickets = new Map();
    this.settings = new Map();
    this.activities = [];
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@tiyende.com",
      fullName: "Admin User",
      role: "admin",
      active: true
    });

    // Initialize some sample data for demonstration
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create sample vendors
    this.createVendor({
      name: "Mazhandu Bus",
      contactPerson: "John Mazhandu",
      email: "info@mazhandubus.com",
      phone: "+260 97 1234567",
      address: "Lusaka, Zambia",
      status: "active",
      logo: ""
    });
    
    this.createVendor({
      name: "Power Tools Bus",
      contactPerson: "Maria Daka",
      email: "info@powertoolsbus.com",
      phone: "+260 96 7654321",
      address: "Kitwe, Zambia",
      status: "active",
      logo: ""
    });
    
    // Create sample routes
    this.createRoute({
      vendorId: 1,
      departure: "Lusaka",
      destination: "Livingstone",
      departureTime: "08:00",
      estimatedArrival: "15:00",
      fare: 350,
      capacity: 44,
      status: "active",
      daysOfWeek: ["Monday", "Wednesday", "Friday", "Sunday"]
    });
    
    this.createRoute({
      vendorId: 2,
      departure: "Lusaka",
      destination: "Ndola",
      departureTime: "07:30",
      estimatedArrival: "12:30",
      fare: 200,
      capacity: 44,
      status: "active",
      daysOfWeek: ["Monday", "Tuesday", "Thursday", "Saturday"]
    });
    
    // Create sample settings
    this.updateSetting("system_name", "Tiyende Bus Reservation");
    this.updateSetting("contact_email", "support@tiyende.com");
    this.updateSetting("contact_phone", "+260 97 1234567");

    // Create some sample tickets
    this.createTicket({
      bookingReference: "TIY-8294",
      routeId: 1,
      vendorId: 1,
      customerName: "John Doe",
      customerPhone: "+260 97 1234567",
      customerEmail: "john@example.com",
      seatNumber: 12,
      status: "paid",
      amount: 350,
      paymentMethod: "mobile_money",
      paymentReference: "PAY123456",
      travelDate: new Date("2023-06-15")
    });

    this.createTicket({
      bookingReference: "TIY-8293",
      routeId: 2,
      vendorId: 2,
      customerName: "Maria Sakala",
      customerPhone: "+260 96 7654321",
      customerEmail: "maria@example.com",
      seatNumber: 5,
      status: "pending",
      amount: 200,
      paymentMethod: "mobile_money",
      travelDate: new Date("2023-06-16")
    });

    // Log some activities
    this.createActivity({
      userId: 1,
      action: "New vendor added",
      details: { vendorName: "Zambia Royal Bus" }
    });

    this.createActivity({
      userId: 1,
      action: "New route added",
      details: { route: "Lusaka → Mongu" }
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      lastLogin: null, 
      token: null,
      role: user.role || "staff",
      active: user.active !== undefined ? user.active : true
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async setUserToken(id: number, token: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    user.token = token;
    user.lastLogin = new Date();
    this.users.set(id, user);
    return true;
  }
  
  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }
  
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorId++;
    const newVendor: Vendor = { 
      ...vendor, 
      id, 
      createdAt: new Date(),
      status: vendor.status || "active",
      address: vendor.address || null,
      logo: vendor.logo || null
    };
    this.vendors.set(id, newVendor);
    
    // Log activity
    this.createActivity({
      action: "Vendor created",
      details: { vendorName: vendor.name }
    });
    
    return newVendor;
  }
  
  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...vendorData };
    this.vendors.set(id, updatedVendor);
    
    // Log activity
    this.createActivity({
      action: "Vendor updated",
      details: { vendorName: vendor.name }
    });
    
    return updatedVendor;
  }
  
  async listVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }
  
  async deleteVendor(id: number): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (vendor) {
      // Log activity
      this.createActivity({
        action: "Vendor deleted",
        details: { vendorName: vendor.name }
      });
    }
    
    return this.vendors.delete(id);
  }
  
  // Route operations
  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }
  
  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.routeId++;
    const newRoute: Route = { ...route, id, createdAt: new Date() };
    this.routes.set(id, newRoute);
    
    // Log activity
    const vendor = this.vendors.get(route.vendorId);
    this.createActivity({
      action: "Route created",
      details: { 
        route: `${route.departure} → ${route.destination}`,
        vendor: vendor?.name
      }
    });
    
    return newRoute;
  }
  
  async updateRoute(id: number, routeData: Partial<InsertRoute>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;
    
    const updatedRoute = { ...route, ...routeData };
    this.routes.set(id, updatedRoute);
    
    // Log activity
    this.createActivity({
      action: "Route updated",
      details: { 
        route: `${route.departure} → ${route.destination}`
      }
    });
    
    return updatedRoute;
  }
  
  async listRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }
  
  async getRoutesByVendor(vendorId: number): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(
      (route) => route.vendorId === vendorId
    );
  }
  
  async deleteRoute(id: number): Promise<boolean> {
    const route = this.routes.get(id);
    if (route) {
      // Log activity
      this.createActivity({
        action: "Route deleted",
        details: { 
          route: `${route.departure} → ${route.destination}`
        }
      });
    }
    
    return this.routes.delete(id);
  }
  
  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }
  
  async getTicketByReference(reference: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(
      (ticket) => ticket.bookingReference === reference
    );
  }
  
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const id = this.ticketId++;
    const newTicket: Ticket = { ...ticket, id, bookingDate: new Date() };
    this.tickets.set(id, newTicket);
    
    // Log activity
    this.createActivity({
      action: "Ticket created",
      details: { 
        reference: ticket.bookingReference,
        customer: ticket.customerName
      }
    });
    
    return newTicket;
  }
  
  async updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...ticketData };
    this.tickets.set(id, updatedTicket);
    
    // Log activity
    this.createActivity({
      action: "Ticket updated",
      details: { 
        reference: ticket.bookingReference,
        customer: ticket.customerName,
        status: ticketData.status
      }
    });
    
    return updatedTicket;
  }
  
  async listTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }
  
  async getTicketsByRoute(routeId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.routeId === routeId
    );
  }
  
  async getTicketsByVendor(vendorId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.vendorId === vendorId
    );
  }
  
  // Settings operations
  async getSetting(name: string): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.name === name
    );
  }
  
  async updateSetting(name: string, value: string): Promise<Setting | undefined> {
    let setting = Array.from(this.settings.values()).find(
      (s) => s.name === name
    );
    
    if (setting) {
      setting = { ...setting, value, updatedAt: new Date() };
      this.settings.set(setting.id, setting);
    } else {
      const id = this.settingId++;
      setting = {
        id,
        name,
        value,
        description: "",
        updatedAt: new Date()
      };
      this.settings.set(id, setting);
    }
    
    // Log activity
    this.createActivity({
      action: "Setting updated",
      details: { 
        setting: name
      }
    });
    
    return setting;
  }
  
  async listSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
  
  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: new Date() 
    };
    
    this.activities.push(newActivity);
    return newActivity;
  }
  
  async listActivities(limit: number = 20): Promise<Activity[]> {
    // Sort by timestamp descending and limit
    return [...this.activities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Analytics operations
  async getDashboardStats(): Promise<DashboardStats> {
    const allTickets = Array.from(this.tickets.values());
    const activeVendors = Array.from(this.vendors.values()).filter(
      (vendor) => vendor.status === "active"
    );
    const activeRoutes = Array.from(this.routes.values()).filter(
      (route) => route.status === "active"
    );
    
    const totalRevenue = allTickets
      .filter(ticket => ticket.status === "paid")
      .reduce((sum, ticket) => sum + ticket.amount, 0);
    
    // Sort tickets by booking date (newest first) and take the first 5
    const recentBookings = [...allTickets]
      .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime())
      .slice(0, 5);
    
    // Get recent activities (already sorted in listActivities method)
    const recentActivities = await this.listActivities(5);
    
    return {
      totalBookings: allTickets.length,
      totalRevenue,
      activeVendors: activeVendors.length,
      activeRoutes: activeRoutes.length,
      recentBookings,
      recentActivities
    };
  }
}

export const storage = new MemStorage();
